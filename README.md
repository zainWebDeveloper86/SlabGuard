# SlabGuard

An AI-powered electricity bill prediction and slab-shock alert system for MEPCO consumers in Pakistan.

**Status:** Final Year Project (BSCS) — In Development

## Overview

SlabGuard helps electricity consumers monitor their usage, predict monthly bills, and receive alerts before crossing higher billing slabs.

The platform combines electricity consumption tracking, AI-based forecasting, and tariff calculations to help users understand and manage their electricity costs.

## Features

### Consumers

- Account registration and onboarding
- Dashboard with electricity usage and slab progress
- AI-powered monthly bill predictions
- Slab-crossing alerts and saving suggestions
- Electricity bill history synchronization
- Daily consumption analytics
- Tariff information and billing breakdown
- Appliance and electricity settings
- Support tickets and notifications

### Admins

- Platform overview dashboard
- User management
- Electricity tariff management
- User notifications and announcements
- Support ticket management

### Additional Features

- JWT authentication and role-based access
- Password recovery via email
- IoT usage data integration
- Responsive UI with dark mode

## Tech Stack

- **Frontend:** React 19, Vite, React Router, Context API
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **AI Forecasting:** Python, FastAPI, Prophet, pandas
- **Data Acquisition:** Puppeteer, node-cron
- **Weather API:** Open-Meteo
- **Email:** Nodemailer

## Architecture

SlabGuard uses three primary components:

- **Billing Engine:** Calculates estimated electricity bills based on configured tariffs and consumption.
- **Forecasting Engine:** Predicts month-end electricity usage using historical consumption data.
- **Data Acquisition:** Collects electricity bill history and processes usage readings.

The forecasting service uses Prophet with a moving-average fallback when sufficient data or the forecasting service is unavailable.

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- MongoDB database
- Python 3.10+
- SMTP credentials
- MEPCO reference number for bill synchronization

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zainWebDeveloper86/slabguard.git
   cd slabguard
   ```

2. Set up the backend:

   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

   Open `backend/.env` and configure the required environment variables with your own credentials.

3. Start the backend:

   ```bash
   npm run dev
   ```

4. Set up the forecasting service in a separate terminal from the project root:

   ```bash
   cd ml-service
   python -m venv venv
   ```

   Activate the virtual environment:

   **Windows:**

   ```bash
   venv\Scripts\activate
   ```

   **Linux / macOS:**

   ```bash
   source venv/bin/activate
   ```

   Install dependencies and start the service:

   ```bash
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

5. Set up the frontend in another terminal from the project root:

   ```bash
   cd frontend
   npm install
   cp .env.example .env
   ```

   Configure `VITE_SERVER_URL` as `http://localhost:8080`.

6. Start the frontend:

   ```bash
   npm run dev
   ```

Open [http://localhost:5173](http://localhost:5173) to view the application.

**Note:** Never commit `.env` files containing private credentials. Ensure they are excluded from version control.

## Known Limitations

- **IoT Integration:** Electricity readings currently use simulated data; physical hardware integration is pending.
- **Bill Scanning:** OCR-based bill scanning is not implemented.
- **Billing Accuracy:** Some charges and consumer categories are not yet supported. Predictions and estimates should not be treated as official MEPCO bills.
- **Forecasting:** Prediction accuracy depends on the availability and quality of consumption data.
- **Notifications:** Alerts are currently available within the application only.

## Author

**Zain** — [GitHub](https://github.com/zainWebDeveloper86)

## License

Built as a Final Year Project for educational and portfolio purposes.