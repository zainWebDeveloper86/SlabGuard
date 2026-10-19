# SlabGuard forecasting service

## Existing working Windows environment

Open an Anaconda/Miniconda Prompt:

```bat
cd /d "D:\University Data\slabguard\ml-service"
conda activate slabguard-ml
python -m uvicorn main:app --reload --port 8000
```

Change the checkout path if needed. Leave this terminal running while using
predictions in the frontend. Stop this service with Ctrl+C before starting
another copy on port 8000.

PowerShell works when Conda activation is configured there. Activating the
environment selects Python and sets paths for native libraries used by Stan.
Calling the environment's Python executable directly without activation can
still fail to load those libraries. The project's local `venv` is a separate
environment and is not the setup verified here.

## Observed versions

These versions were read from the existing `slabguard-ml` environment on
2026-10-20. They are a diagnostic snapshot, not a complete environment lockfile
or a validated fresh-install recipe.

| Component | Version |
| --- | --- |
| Python | 3.11.16 |
| Prophet | 1.4.0 |
| CmdStanPy | 1.3.0 |
| NumPy | 2.4.6 |
| pandas | 3.0.5 |
| FastAPI | 0.141.1 |
| Uvicorn | 0.52.4 |
| Pydantic | 2.13.5 |
| python-dotenv | 1.2.3 |

`requirements.txt` currently pins older packages, including Prophet 1.1.6.
Installing it into this environment can replace working packages. Reconciling
the dependency manifest and testing a fresh environment is a separate task.

Confirm the selected Python and key versions without opening credential files:

```bat
python -c "import sys; from importlib.metadata import version; print(sys.executable); print('Prophet:', version('prophet')); print('CmdStanPy:', version('cmdstanpy'))"
```

## Forecast smoke tests

In a separate activated prompt, from the project root:

```bat
conda activate slabguard-ml
cd /d "D:\University Data\slabguard"
python -B -m unittest discover -s ml-service/tests -p test_forecast_smoke.py -v
```

These tests run the application's forecasting function with synthetic daily
readings, including actual Prophet fitting with and without temperature. They
also check the health function and insufficient-history response. Environment
file loading is disabled during the tests; they do not access the database,
read credentials, or require the web server to be running. Stan may create
temporary model-output files. No additional test packages are required.

The tests also cover explicit forecast ranges, missing dates, duplicate history
and preserving temperatures on known dates. These are function-level smoke tests, not an HTTP integration or forecasting
accuracy evaluation. Check the running service at `http://localhost:8000/health`;
then generate a prediction through the frontend and confirm `POST /forecast`
returns `200 OK` and the frontend identifies Prophet as the model.

## Calendar-month projection contract

The backend now sends `forecast_start` and `forecast_end` as Pakistan calendar
dates. Both must be present together. Python returns one forecast point for
every date in that inclusive range, even when history ends earlier or contains
gaps. The original `days_to_forecast`-only request still forecasts days after
the latest historical date for older clients.

For the calendar-month projection, the backend trains on at least ten complete
past days (`hoursLogged == 24`). Today's data and incomplete days are excluded
from training and measured daily totals. The backend uses complete recorded
days as actuals and estimates all other dates, including today, without adding
the same day twice. The prediction screen shows the target range and recorded
versus estimated coverage. The current day's partial consumption is not yet
used to adjust its full-day estimate.

This remains a calendar-month estimate, not the consumer's actual utility
reading cycle. Temperature is retained on known dates; unknown temperatures
use the historical mean, not live future-weather forecasts. The displayed
model score is a heuristic and must not be reported as measured accuracy.

## Interpreting terminal messages

- `Importing plotly failed` concerns optional interactive plots. This service
  returns forecast data and does not use those plots.
- `stan_backend` errors can hide the underlying native-engine initialization
  failure. Confirm the activated environment before changing packages.
- Successful model processing and `POST /forecast ... 200 OK` confirm that
  request completed. They do not establish prediction accuracy.
