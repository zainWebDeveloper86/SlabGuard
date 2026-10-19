"""Real Prophet smoke tests using synthetic data and no credential files."""

from datetime import date, timedelta
from pathlib import Path
import runpy
import unittest
from unittest.mock import patch
import pandas as pd


class ForecastSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        source = Path(__file__).resolve().parents[1] / "main.py"
        # main.py imports this function; disable it before loading the module.
        with patch("dotenv.load_dotenv", return_value=False) as loader:
            cls.service = runpy.run_path(str(source))
            loader.assert_called_once_with()

    def history(self, with_temperature=False, days=30):
        start = date(2026, 9, 1)
        point_type = self.service["DailyPoint"]
        return [
            point_type(
                ds=(start + timedelta(days=i)).isoformat(),
                y=8 + (i % 7) * 0.6 + i * 0.03,
                temp=25 + (i % 9) * 0.5 if with_temperature else None,
                is_holiday=(start + timedelta(days=i)).weekday() >= 5,
            )
            for i in range(days)
        ]

    def check_forecast(self, with_temperature):
        payload = self.service["ForecastRequest"](
            history=self.history(with_temperature), days_to_forecast=5,
            forecast_start=date(2026, 10, 1) if with_temperature else None,
            forecast_end=date(2026, 10, 5) if with_temperature else None,
        )
        result = self.service["forecast"](payload)
        self.assertEqual(len(result.forecast), 5)
        self.assertEqual(result.daysUsedForTraining, 30)
        self.assertEqual(result.modelVersion, "prophet-v1")
        self.assertEqual(result.usedTemperatureRegressor, with_temperature)
        self.assertEqual(
            [point.ds for point in result.forecast],
            [(date(2026, 10, 1) + timedelta(days=i)).isoformat() for i in range(5)],
        )
        for point in result.forecast:
            self.assertGreaterEqual(point.yhat, 0)
            self.assertGreaterEqual(point.yhat_lower, 0)
            self.assertGreaterEqual(point.yhat_upper, point.yhat_lower)

    def test_health(self):
        self.assertEqual(self.service["health"](), {"status": "ok"})

    def test_forecast_without_temperature(self):
        self.check_forecast(False)

    def test_forecast_with_temperature(self):
        self.check_forecast(True)

    def test_insufficient_history(self):
        payload = self.service["ForecastRequest"](history=self.history(days=3))
        with self.assertRaises(self.service["HTTPException"]) as caught:
            self.service["forecast"](payload)
        self.assertEqual(caught.exception.status_code, 400)

    def test_explicit_range_includes_gaps_and_preserves_known_temperature(self):
        captured = {}

        class FakeProphet:
            def __init__(self, **kwargs):
                pass

            def add_regressor(self, name):
                pass

            def fit(self, frame):
                captured["training"] = frame.copy()

            def predict(self, frame):
                captured["prediction"] = frame.copy()
                return frame.assign(yhat=10.0, yhat_lower=8.0, yhat_upper=12.0)

        history = self.history(True)
        del history[14]
        payload = self.service["ForecastRequest"](
            history=history, forecast_start=date(2026, 9, 1), forecast_end=date(2026, 10, 31)
        )
        with patch.dict(self.service["forecast"].__globals__, {"Prophet": FakeProphet}):
            result = self.service["forecast"](payload)
        self.assertEqual(len(result.forecast), 61)
        self.assertEqual(result.forecast[0].ds, "2026-09-01")
        self.assertEqual(result.forecast[-1].ds, "2026-10-31")
        self.assertIn("2026-09-15", [point.ds for point in result.forecast])
        predicted = captured["prediction"].set_index("ds")
        self.assertEqual(predicted.loc[pd.Timestamp("2026-09-02"), "temp"], 25.5)
        self.assertEqual(predicted.loc[pd.Timestamp("2026-10-31"), "temp"], captured["training"]["temp"].mean())

    def test_invalid_ranges_and_duplicate_dates_are_rejected(self):
        request_type = self.service["ForecastRequest"]
        for bounds in [
            {"forecast_start": date(2026, 10, 1)},
            {"forecast_start": date(2026, 10, 5), "forecast_end": date(2026, 10, 1)},
            {"forecast_start": date(2026, 1, 1), "forecast_end": date(2027, 1, 2)},
        ]:
            with self.subTest(bounds=bounds):
                with self.assertRaises(self.service["HTTPException"]) as caught:
                    self.service["forecast"](request_type(history=self.history(), **bounds))
                self.assertEqual(caught.exception.status_code, 400)
        history = self.history()
        history.append(history[0])
        with self.assertRaises(self.service["HTTPException"]) as caught:
            self.service["forecast"](request_type(history=history))
        self.assertEqual(caught.exception.status_code, 400)


if __name__ == "__main__":
    unittest.main()
