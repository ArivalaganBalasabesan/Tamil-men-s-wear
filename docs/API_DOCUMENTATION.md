# Tamil Men's Wear API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register
`POST /auth/register`
- Body: `{ name, email, password }`

### Login
`POST /auth/login`
- Body: `{ email, password }`

### Google Login
`POST /auth/google`
- Body: `{ email, name, googleId }`

## Products

### Get All Products
`GET /products`

### Get Product Details
`GET /products/:id`

### Create Product (Admin)
`POST /products`
- Auth: Required (Admin)

## Orders

### Create Order
`POST /orders`
- Auth: Required

### Get User Orders
`GET /orders/user`
- Auth: Required

### Get All Orders (Admin)
`GET /orders`
- Auth: Required (Admin)

## User Profile

### Update Profile Settings
`PUT /auth/profile`
- Auth: Required
- Body: `{ height, weight, age }`
