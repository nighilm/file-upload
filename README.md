---
# 📁 NestJS File Upload & Processing API

A NestJS application for authenticated file uploads with metadata, asynchronous background processing, and a secure API architecture.
---

## 🚀 Features

- 🔐 JWT-based authentication
- 📤 Authenticated file uploads (any file type)
- ⚙️ Asynchronous file processing using BullMQ (Redis)
- 🔄 Rate limiting with Throttler Guard
- 📑 Swagger API documentation
- 🐳 Docker-based local environment

  ***

## 🧰 Technologies Used

- **Node.js** v22
- **NestJS** framework
- **PostgreSQL** with **Prisma ORM**
- **Redis** + **BullMQ** for background jobs
- **Multer** for file handling
- **JWT** for secure authentication
- **Swagger** for API documentation
- **Docker** for containerized environment
- **@nestjs/throttler** for rate limiting

---

## 📦 API Endpoints

### 1. 🔐 POST `/auth/login`

**Authenticate users and issue JWT.**

**Request:**

```json
{
  "email": "your-email",
  "password": "your-password"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "<JWT token>"
  },
  "message": "Login successfull"
}
```

> **Note:** JWT is required for all subsequent requests.

---

### 2. 📤 POST `/files/upload`

**Upload a file with optional metadata.**

**Headers:**

```
Authorization: Bearer <JWT>
```

**Form Data:**

- `file`: (any file)
- `title`: (optional)
- `description`: (optional)

**Response:**

```json
{
  "statusCode": 201,
  "data": {
    "fileId": "1",
    "status": "uploaded"
  },
  "message": "File upload successful"
}
```

---

### 3. ⚙️ File Processing (Async Job)

**Automatically triggered post-upload.**

- Non-`.txt` files → status: `failed`
- `.txt` files → extract last line, save to DB
- Status transitions: `uploaded → processing → processed/failed`

---

### 4. 📄 GET `/files/:id`

**Get file status and metadata.**

**Headers:**

```
Authorization: Bearer <JWT>
```

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "originalFilename": "README.md",
    "title": null,
    "description": null,
    "storagePath": "uploads/1/file_1747832939867.md",
    "status": "failed",
    "extractedData": null
  },
  "message": "File status"
}
```

---

## 🏗️ Design Choices

- **Modular Architecture** with NestJS for scalability and maintainability
- **Prisma** for easy schema management and type-safe queries
- **BullMQ with Redis** for efficient job queuing and retries
- **Multer** for handling multipart/form-data uploads
- **Local Disk Storage** for simplicity in development (can be replaced with S3 in production)

---

## ⚠️ Limitations

- No user registration endpoint (assumes pre-existing user).

---

## 📦 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/nighilm/file-upload.git
cd file-upload
```

### 2. Create `.env` file

```env
PORT=3000
NODE_ENV=development

DATABASE_URL="postgres://<postgres_username>:<postgres_password>@<postgres_host>:<postgres_port>/file-upload"
POSTGRES_USERNAME=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_PORT=5432

JWT_ACCESS_TOKEN_SECRET="secret"
ACCESS_TOKEN_VALIDITY_DURATION='1d'

REDIS_HOST=redis
REDIS_PORT=6379

BULL_BOARD_ADMIN_ROUTE='admin/queues'
BULL_BOARD_ADMIN_PASSWORD=password
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run PostgreSQL and Redis (Docker Compose)

```bash
docker-compose up --build -V -d
```

### 5. Run Prisma migrations

- Create database in postgres named `file-upload`
  -Run the Prisma migration and seed commands from within the Docker container where the application is running, using its internal CLI.

```bash
npm run migrate
npm run seed
```

### 7. Access Swagger Docs

```
http://localhost:3000/api
```

---

## 🗄️ Prisma Schema Snapshot

```prisma

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  createdAt DateTime @default(now()) @map("created_at")

  files File[]

  @@map("users")
}

model File {
  id               Int        @id @default(autoincrement())
  userId           Int        @map("user_id")
  originalFilename String     @map("original_filename")
  storagePath      String     @map("storage_path")
  title            String?
  description      String?
  status           FileStatus @default(uploaded)
  extractedData    String?    @map("extracted_data")
  createdAt        DateTime   @default(now()) @map("created_at")

  user User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobs Job[]

  @@map("files")
}

model Job {
  id           Int       @id @default(autoincrement())
  fileId       Int       @map("file_id")
  jobType      String?   @map("job_type")
  status       JobStatus
  errorMessage String?   @map("error_message")
  startedAt    DateTime? @map("started_at")
  completedAt  DateTime? @map("completed_at")

  file File @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@map("jobs")
}

```

---

## ✅ Test Accounts

For testing login:

```json
{
  "email": "user@gmail.com",
  "password": "password"
}
```
