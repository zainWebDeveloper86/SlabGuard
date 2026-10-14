import os
from typing import List, Optional

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from prophet import Prophet

load_dotenv()

app = FastAPI(title="SlabGuard Forecasting Service", version="1.0.0")

# Prophet needs a reasonable amount of history to fit anything meaningful.
# Below this, the model output would basically be noise — better to refuse
# and let Node fall back to the moving-average model.
MIN_DAYS_REQUIRED = 10


class DailyPoint(BaseModel):
    ds: str  # date string "YYYY-MM-DD" — Prophet's required column name
    y: float  # units consumed that day — Prophet's required column name
    temp: Optional[float] = None
    is_holiday: Optional[bool] = False


class ForecastRequest(BaseModel):
    history: List[DailyPoint]
    days_to_forecast: int = 14


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
    if len(payload.history) < MIN_DAYS_REQUIRED:
        raise HTTPException(
            status_code=400,
            detail=f"Need at least {MIN_DAYS_REQUIRED} days of daily history, got {len(payload.history)}.",
        )

    df = pd.DataFrame([p.model_dump() for p in payload.history])
    df["ds"] = pd.to_datetime(df["ds"])
    df["is_holiday"] = df["is_holiday"].astype(int)  # Prophet regressors need numbers, not True/False

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

    future = model.make_future_dataframe(periods=payload.days_to_forecast)

    # we know the future's actual weekday, so is_holiday for future dates is exact — not a guess, unlike temperature
    future["is_holiday"] = future["ds"].dt.dayofweek.isin([5, 6]).astype(int)
    if use_temp:
        # Naive assumption for future temperature: hold at the recent average. Documented limitation — a real weather-forecast API (not just current weather) would replace this later.
        future["temp"] = df["temp"].mean()

    forecast_df = model.predict(future)
    future_only = forecast_df[forecast_df["ds"] > df["ds"].max()]

    result = [
        ForecastPoint(
            ds=row["ds"].strftime("%Y-%m-%d"),
            yhat=max(0, round(row["yhat"], 2)),  # units can't be negative
            yhat_lower=max(0, round(row["yhat_lower"], 2)),
            yhat_upper=max(0, round(row["yhat_upper"], 2)),
        )
        for _, row in future_only.iterrows()
    ]

    return ForecastResponse(
        forecast=result,
        modelVersion="prophet-v1",
        daysUsedForTraining=len(df),
        usedTemperatureRegressor=use_temp,
    )