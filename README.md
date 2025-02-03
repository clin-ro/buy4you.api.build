# Buy4You API

## Description

Buy4You is a B2B platform that facilitates interactions between admins, buyers (companies and individuals), and suppliers. The platform manages orders, quotations, job sites, and subscriptions.

## Features

- User role management (Admin, Buyer, Supplier)
- Order and quotation management
- Job site management with invitation system
- Subscription plans
- File storage with MinIO
- Email notifications
- Payment processing with Stripe
- API documentation with Swagger

## Business Logic

### User Roles and Permissions

#### Admin
- Full system access and management
- User management (create, edit, delete, assign roles)
- Order management (view, supplier selection, notifications)
- Subscription and payment management
- Configure payment requirements at buyer level

#### Buyer (Company or Individual)
- Profile management (company/individual information)
- Order creation and management
- Job site management with invitation system
- Quotation management (if self-managed)
- Subscription monitoring
- Payment settings inherited from admin configuration

#### Supplier
- Order notification reception
- Quotation submission
- Company profile management
- Order fulfillment based on accepted quotes

### Key Processes

#### 1. Profile Completion (Buyer)
- Registration as Company or Individual
- Required fields based on type
- Status tracking (Incomplete/Pending Review/Completed)

#### 2. Order Management
- Buyer creates orders with product details
- Asynchronous processing queue
- Status tracking from creation to completion

#### 3. Job Site Management
- Creation with address and contact information
- Invitation system:
  - Generate secure invitation links and QR codes
  - Configurable expiration times
  - Track invitation status (pending/accepted/expired)
  - Owner-only invitation management
  - Single-use secure links

#### 4. Order Assignment
- Admin selects suppliers based on criteria
- Email notifications to suppliers
- Multiple supplier assignment support

#### 5. Quotation System
- Supplier quote submission with PDF support
- Partial fulfillment handling
- Multiple supplier coordination
- Status tracking and notifications

#### 6. Order Fulfillment
- Status progression tracking
- Partial fulfillment support
- Multiple supplier coordination
- Invoice management

#### 7. Payment Processing
- Configurable payment requirements
- Stripe integration
- Status tracking
- Receipt management

## Installation

```bash
$ npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Update the environment variables with your values

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api/docs
```

## Project Structure

```
src/
├── app.module.ts
├── main.ts
├── admin/
├── auth/
├── buyer/
├── supplier/
├── resources/
│   ├── job-sites/
│   ├── notifications/
│   ├── orders/
│   ├── profiles/
│   ├── quotations/
│   └── subscription-plans/
├── schemas/
│   └── mongo/
├── swagger/
└── utils/
    ├── filters/
    ├── mailer/
    └── minio/
```

## Security Features

- JWT Authentication
- Role-based access control
- API key authentication
- Rate limiting
- Secure invitation system
- Payment security through Stripe

## License

This project is proprietary and confidential.
