# Entity-Relationship Model

```mermaid
erDiagram
    SPACES ||--o{ BOOKINGS : has
    USERS o|--o{ BOOKINGS : associated_with
    SPACES {
      BIGINT id PK
      VARCHAR name
      ENUM space_type
      VARCHAR building
      VARCHAR floor_label
      INT capacity
      VARCHAR description
      JSON equipment
      BOOLEAN is_active
    }
    USERS {
      BIGINT id PK
      VARCHAR full_name
      VARCHAR email UK
      ENUM role
    }
    BOOKINGS {
      BIGINT id PK
      BIGINT space_id FK
      BIGINT user_id FK "nullable"
      VARCHAR booked_by
      VARCHAR email
      VARCHAR purpose
      DATE booking_date
      TIME start_time
      TIME end_time
      ENUM status
    }
```

**Relationships:** one space can have many bookings; each booking belongs to one space. A user can optionally be linked to many bookings; demo bookings store name/email directly and leave `user_id` null. Active bookings for the same space cannot overlap on the same date. Adjacent periods (09:00–10:00 and 10:00–11:00) are allowed.
