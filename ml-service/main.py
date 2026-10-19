from datetime import date
from typing import List, Optional

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from prophet import Prophet

load_dotenv()

app = FastAPI(title="SlabGuard Forecasting Service", version="1.0.0")

# Prophet needs a reasonable amount of history to fit anything meaningful.
# Below this, the model output would basically be noise — better to refuse
# and let Node fall back to the moving-average model.
MIN_DAYS_REQUIRED = 10


class DailyPoint(BaseModel):
    ds: date  # calendar date "YYYY-MM-DD" — Prophet's required column name
    y: float = Field(ge=0, allow_inf_nan=False)
    temp: Optional[float] = None
    is_holiday: Optional[bool] = False


class ForecastRequest(BaseModel):
    history: List[DailyPoint]
    days_to_forecast: int = Field(default=14, ge=1, le=366)
    forecast_start: Optional[date] = None
    forecast_end: Optional[date] = None


class ForecastPoint(BaseModel):
    ds: str
    yhat: float
    yhat_lower: float
    yhat_upper: float


class ForecastResponse(BaseModel):
    forecast: List[ForecastPoint]
    modelVersion: str
    daysUsedForTraining: int
    usedTemperatureRegressor: bool


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/forecast", response_model=ForecastResponse)
def forecast(payload: ForecastRequest):
    if (payload.forecast_start is None) != (payload.forecast_end is None):
        raise HTTPException(status_code=400, detail="Provide both forecast_start and forecast_end.")
    if payload.forecast_start is not None:
        span = (payload.forecast_end - payload.forecast_start).days
        if span < 0 or span >= 366:
            raise HTTPException(status_code=400, detail="Forecast range must contain 1 to 366 days.")
    if len(payload.history) < MIN_DAYS_REQUIRED:
        raise HTTPException(
            status_code=400,
            detail=f"Need at least {MIN_DAYS_REQUIRED} days of daily history, got {len(payload.history)}.",
        )

    df = pd.DataFrame([p.model_dump() for p in payload.history])
    df["ds"] = pd.to_datetime(df["ds"])
    if df["ds"].duplicated().any():
        raise HTTPException(status_code=400, detail="History must have one reading per date.")
    df = df.sort_values("ds")
    df["is_holiday"] = df["is_holiday"].fillna(False).astype(int)

    # temperature as a regressor
    
    temp_coverage = df["temp"].notna().mean()
    use_temp = temp_coverage >= 0.8

    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True,
        yearly_seasonality=False,  # not enough history yet for a yearly pattern
    )

    model.add_regressor("is_holiday")
    columns_to_fit = ["ds", "y", "is_holiday"]

    if use_temp:
        df["temp"] = df["temp"].fillna(df["temp"].mean())
        model.add_regressor("temp")
        columns_to_fit.append("temp")

    model.fit(df[columns_to_fit])

    if payload.forecast_start is not None:
        # An explicit range includes gaps before the last recorded date and
        # reaches the requested end date even when history is stale.
        future = pd.DataFrame({"ds": pd.date_range(payload.forecast_start, payload.forecast_end)})
    else:
        # Preserve the original horizon-only API for older clients.
        future = model.make_future_dataframe(periods=payload.days_to_forecast)
        future = future[future["ds"] > df["ds"].max()].copy()

    # we know the future's actual weekday, so is_holiday for future dates is exact — not a guess, unlike temperature
    future["is_holiday"] = future["ds"].dt.dayofweek.isin([5, 6]).astype(int)
    if use_temp:
        # Naive assumption for future temperature: hold at the recent average. Documented limitation — a real weather-forecast API (not just current weather) would replace this later.
        known_temperatures = df.set_index("ds")["temp"]
        future["temp"] = future["ds"].map(known_temperatures).fillna(df["temp"].mean())

    forecast_df = model.predict(future)

    result = [
        ForecastPoint(
            ds=row["ds"].strftime("%Y-%m-%d"),
            yhat=max(0, round(row["yhat"], 2)),  # units can't be negative
            yhat_lower=max(0, round(row["yhat_lower"], 2)),
            yhat_upper=max(0, round(row["yhat_upper"], 2)),
        )
        for _, row in forecast_df.iterrows()
    ]

    return ForecastResponse(
        forecast=result,
        modelVersion="prophet-v1",
        daysUsedForTraining=len(df),
        usedTemperatureRegressor=use_temp,
    )
