
# SafeFit — Smart Bracelet

SafeFit is a compact, screenless smart bracelet focused on continuous health monitoring and autonomous personal safety. It is designed to function offline using embedded GSM/GPS modules and to synchronize with a companion mobile app when connectivity is available.

## Key Features

- **Autonomous Emergency Alerts**: SOS activation, automatic SMS and auto-call to pre-configured contacts via the SIM800L GSM module.
- **Fall Detection**: Real-time fall detection using the MPU6050 accelerometer and gyroscope.
- **Vital Sign Monitoring**: Continuous heart rate and SpO₂ measurement using the MAX30102 sensor.
- **Body Temperature**: Digital temperature monitoring using a DS18B20 sensor.
- **Activity Tracking**: Step counting and basic activity detection from MPU6050 sensor data.
- **Location Tracking**: GPS-based real-time coordinates using the SIM28ML module; works offline for later synchronization.
- **Offline-First Design**: Stores events and data locally and syncs to the backend (Supabase) when network is available.
- **Optional Long-Range Connectivity**: LoRa integration option for low-network regions.
- **Low-Power Operation**: Battery powered (Li-Po), optimized sampling and logging to extend runtime.

## Hardware Components (summary)

- NodeMCU ESP8266 — Main microcontroller
- MAX30102 — Heart rate & SpO₂ sensor
- MPU6050 — 3-axis accelerometer + gyroscope (fall detection, steps)
- DS18B20 — Digital temperature sensor
- SIM800L — GSM modem (SMS / voice)
- SIM28ML — GPS module
- MAX9814 — Microphone (optional audio during emergency calls)
- Li-Po battery (300–500 mAh) + TP4056 charger
- Optional MQ-series gas sensors (CO, LPG, CH4, NH3)

Estimated BOM cost: ~INR 4000 (see `documentation/` for the detailed budget table).

## Software Architecture

- **Firmware**: Arduino/ESP8266 firmware running on NodeMCU — reads sensors, runs detection algorithms, and controls GSM/GPS modules.
- **Mobile App**: React Native (Expo) companion app for visualization, historical trends, and device settings.
- **Backend**: Supabase (Postgres + Auth) for authenticated storage, synchronization, and analytics.

## Development — Frontend (local)

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The frontend is a Vite + React + TypeScript project using Tailwind CSS and shadcn-ui components.

## Firmware & Hardware Workflows

- The firmware collects sensor data continuously, evaluates anomaly conditions (e.g., fall detected, abnormal vitals), and triggers SOS protocols.
- On SOS, the device captures GPS coordinates, sends an SMS with location, and can place an automatic call for voice monitoring.
- All events and sensor readings are stored locally and uploaded to Supabase when connectivity is restored.

## Documentation

See the `documentation/` folder for implementation details and guides:

- [QUICK_START.md](documentation/QUICK_START.md)
- [SUPABASE_AUTH_SETUP.md](documentation/SUPABASE_AUTH_SETUP.md)
- [PROFILE_STORAGE_GUIDE.md](documentation/PROFILE_STORAGE_GUIDE.md)
- [SHARED_SENSOR_DATA_SETUP.md](documentation/SHARED_SENSOR_DATA_SETUP.md)
- [HEIGHT_WEIGHT_SETUP.md](documentation/HEIGHT_WEIGHT_SETUP.md)
- [PARENTAL_CONTROL_GUIDE.md](documentation/PARENTAL_CONTROL_GUIDE.md)
- [BROAI_QUICK_ACTIONS_GUIDE.md](documentation/BROAI_QUICK_ACTIONS_GUIDE.md)
- [AUTH_IMPLEMENTATION_GUIDE.md](documentation/AUTH_IMPLEMENTATION_GUIDE.md)
- [SUPABASE_INTEGRATION_STATUS.md](documentation/SUPABASE_INTEGRATION_STATUS.md)


## Contributing

Contributions are welcome. Please fork the repo, make changes on a feature branch, and open a pull request describing your changes.


## Contact

For questions about the hardware design, firmware, or documentation, open an issue or contact the maintainers via the repository issue tracker.
