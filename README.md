# P2P Service Marketplace

A full-stack, peer-to-peer service marketplace allowing buyers to hire and pay professionals securely using an escrow system.

## Features

- **Dual Roles**: Sign up as a Service Buyer or Service Provider.
- **Job Posting & Bidding**: Buyers post tasks, Providers apply with cover letters and proposed prices.
- **Escrow Payment System**: Buyers deposit funds into a secure platform wallet, which are only released to the provider upon job completion.
- **Real-time Chat**: Instantly communicate with your counterpart during an active order using Socket.io.
- **Admin Panel**: Dedicated dashboard for admins to monitor jobs, users, orders, and resolve disputes.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Zustand.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io, JWT Authentication.

## How to Run Locally

### Prerequisites
- Node.js installed (v18+)
- Local MongoDB running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI.

### 1. Setup Backend
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Create a `.env` file in the `backend` folder and add `MONGO_URI` and `JWT_SECRET`. Defaults are provided in code for local testing.
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will be running on http://localhost:5000*

### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The React app will be running on http://localhost:5173*

## Demo Walkthrough
1. **Register** a Buyer account.
2. **Register** a Provider account in another incognito window.
3. As the **Buyer**, click "Post a Job" and create a task.
4. As the **Provider**, search for the task and click "Apply". Provide a price and message.
5. As the **Buyer**, go to your Dashboard, view the application, and click "Accept & Hire".
6. Navigate to the Order Details page. The Buyer clicks "Deposit to Escrow" to secure the funds.
7. Use the chat box to communicate in real-time.
8. Once the provider finishes the task, the Buyer clicks "Job Done! Release Funds".
9. The provider's virtual wallet is credited!
