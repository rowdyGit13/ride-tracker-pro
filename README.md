## Overview

Ride Tracker Pro helps rideshare drivers understand their true profit by tracking earnings, expenses, and time spent working. The application provides detailed analytics, visualizations, and insights to maximize profitability.

## Features

- **Earnings Tracker:** Log and categorize all earnings with detailed breakdowns by platform, time, and location
- **Expense Management:** Track gas, maintenance, and other expenses with automatic tax deduction calculations
- **Performance Analytics:** Visualize performance with intuitive charts to identify opportunities to increase earnings
- **Multi-platform Support:** Compatible with all major rideshare services
- **Responsive Design:** Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, shadcn/ui
- **Authentication:** Clerk
- **State Management:** React hooks
- **Styling:** Tailwind CSS with custom theming
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ride-tracker-pro.git

# Navigate to the project directory
cd ride-tracker-pro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start the development server
npm run dev
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_database_url
```

## Project Structure

```
ride-tracker-pro/
├── actions/           # Server actions for data fetching
├── app/               # Next.js app directory
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Dashboard views
│   ├── forms/         # Data entry forms
├── components/        # Reusable React components
│   ├── ui/            # UI components
│   ├── dashboard/     # Dashboard-specific components
├── public/            # Static assets
└── lib/               # Utilities and helpers
```

## Usage

After logging in, you can:

1. Record ride earnings and expenses
2. View dashboard analytics
3. Track performance metrics over time
4. Generate reports for tax purposes

## License

© 2024 Ride Tracker Pro. All rights reserved.
