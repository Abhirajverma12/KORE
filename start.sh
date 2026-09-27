#!/bin/bash
echo "Starting KORE Full Stack Platform..."

# Start Backend
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Start Frontend
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo "KORE Backend PID: $BACKEND_PID (http://localhost:5001)"
echo "KORE Frontend PID: $FRONTEND_PID (http://localhost:3000)"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
