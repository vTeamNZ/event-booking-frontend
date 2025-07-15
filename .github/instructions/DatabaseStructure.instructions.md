---
applyTo: '**'
---
Coding standards, domain knowledge, and preferences that AI should follow.

## Table: __EFMigrationsHistory - MigrationId (nvarchar(300), NOT NULL) - ProductVersion (nvarchar(64), NOT NULL)
## Table: AspNetRoleClaims - Id (int, NOT NULL) - RoleId (nvarchar(900), NOT NULL) - ClaimType (nvarchar(-1), NULL) - ClaimValue (nvarchar(-1), NULL)
## Table: AspNetRoles - Id (nvarchar(900), NOT NULL) - Name (nvarchar(512), NULL) - NormalizedName (nvarchar(512), NULL) - ConcurrencyStamp (nvarchar(-1), NULL)
## Table: AspNetUserClaims - Id (int, NOT NULL) - UserId (nvarchar(900), NOT NULL) - ClaimType (nvarchar(-1), NULL) - ClaimValue (nvarchar(-1), NULL)
## Table: AspNetUserLogins - LoginProvider (nvarchar(900), NOT NULL) - ProviderKey (nvarchar(900), NOT NULL) - ProviderDisplayName (nvarchar(-1), NULL) - UserId (nvarchar(900), NOT NULL)
## Table: AspNetUserRoles - UserId (nvarchar(900), NOT NULL) - RoleId (nvarchar(900), NOT NULL)
## Table: AspNetUsers - Id (nvarchar(900), NOT NULL) - FullName (nvarchar(-1), NOT NULL) - Role (nvarchar(-1), NOT NULL) - UserName (nvarchar(512), NULL) - NormalizedUserName (nvarchar(512), NULL) - Email (nvarchar(512), NULL) - NormalizedEmail (nvarchar(512), NULL) - EmailConfirmed (bit, NOT NULL) - PasswordHash (nvarchar(-1), NULL) - SecurityStamp (nvarchar(-1), NULL) - ConcurrencyStamp (nvarchar(-1), NULL) - PhoneNumber (nvarchar(-1), NULL) - PhoneNumberConfirmed (bit, NOT NULL) - TwoFactorEnabled (bit, NOT NULL) - LockoutEnd (datetimeoffset, NULL) - LockoutEnabled (bit, NOT NULL) - AccessFailedCount (int, NOT NULL)
## Table: AspNetUserTokens - UserId (nvarchar(900), NOT NULL) - LoginProvider (nvarchar(900), NOT NULL) - Name (nvarchar(900), NOT NULL) - Value (nvarchar(-1), NULL)
## Table: BookingFoods - Id (int, NOT NULL) - BookingId (int, NOT NULL) - FoodItemId (int, NOT NULL) - Quantity (int, NOT NULL)
## Table: Bookings - Id (int, NOT NULL) - EventId (int, NOT NULL) - CreatedAt (datetime2, NOT NULL) - TotalAmount (decimal, NOT NULL)
## Table: BookingTickets - Id (int, NOT NULL) - BookingId (int, NOT NULL) - TicketTypeId (int, NOT NULL) - Quantity (int, NOT NULL)
## Table: EventBookings - Id (int, NOT NULL) - EventName (nvarchar(-1), NOT NULL) - SeatNo (nvarchar(-1), NOT NULL) - FirstName (nvarchar(-1), NOT NULL) - PaymentGUID (nvarchar(-1), NOT NULL) - BuyerEmail (nvarchar(-1), NOT NULL) - OrganizerEmail (nvarchar(-1), NOT NULL) - CreatedAt (datetime2, NOT NULL) - TicketPath (nvarchar(-1), NOT NULL) - EventID (nvarchar(-1), NOT NULL)
## Table: Events - Id (int, NOT NULL) - Title (nvarchar(-1), NOT NULL) - Description (nvarchar(-1), NOT NULL) - Date (datetime2, NULL) - Location (nvarchar(-1), NOT NULL) - Price (decimal, NULL) - Capacity (int, NULL) - OrganizerId (int, NULL) - ImageUrl (nvarchar(-1), NULL) - IsActive (bit, NOT NULL) - SeatSelectionMode (int, NOT NULL) - StagePosition (nvarchar(-1), NULL) - VenueId (int, NULL)
## Table: FoodItems - Id (int, NOT NULL) - Name (nvarchar(-1), NOT NULL) - Price (decimal, NOT NULL) - Description (nvarchar(-1), NULL) - EventId (int, NOT NULL)
## Table: Organizers - Id (int, NOT NULL) - Name (nvarchar(-1), NOT NULL) - ContactEmail (nvarchar(-1), NOT NULL) - PhoneNumber (nvarchar(-1), NOT NULL) - UserId (nvarchar(900), NOT NULL) - FacebookUrl (nvarchar(-1), NULL) - YoutubeUrl (nvarchar(-1), NULL) - CreatedAt (datetime2, NOT NULL) - IsVerified (bit, NOT NULL) - OrganizationName (nvarchar(-1), NULL) - Website (nvarchar(-1), NULL)
## Table: PaymentRecords - Id (int, NOT NULL) - PaymentIntentId (nvarchar(-1), NOT NULL) - FirstName (nvarchar(-1), NOT NULL) - LastName (nvarchar(-1), NOT NULL) - Email (nvarchar(-1), NOT NULL) - Mobile (nvarchar(-1), NULL) - EventId (int, NOT NULL) - EventTitle (nvarchar(-1), NOT NULL) - Amount (decimal, NOT NULL) - TicketDetails (nvarchar(-1), NOT NULL) - FoodDetails (nvarchar(-1), NOT NULL) - PaymentStatus (nvarchar(-1), NOT NULL) - CreatedAt (datetime2, NOT NULL) - UpdatedAt (datetime2, NULL)
## Table: Payments - Id (int, NOT NULL) - PaymentIntentId (nvarchar(510), NOT NULL) - Amount (decimal, NOT NULL) - Currency (nvarchar(20), NOT NULL) - Status (nvarchar(100), NOT NULL) - EventId (int, NOT NULL) - TicketDetails (nvarchar(-1), NOT NULL) - FoodDetails (nvarchar(-1), NOT NULL) - UpdatedAt (datetime2, NULL) - Description (nvarchar(1000), NOT NULL) - Email (nvarchar(510), NOT NULL) - FirstName (nvarchar(200), NOT NULL) - LastName (nvarchar(200), NOT NULL) - Mobile (nvarchar(100), NULL)
## Table: Reservations - Id (int, NOT NULL) - UserId (nvarchar(900), NOT NULL) - EventId (int, NOT NULL) - ReservedAt (datetime2, NOT NULL) - IsReserved (bit, NOT NULL) - Number (int, NOT NULL) - Row (nvarchar(-1), NOT NULL)
## Table: SeatReservations - Id (int, NOT NULL) - EventId (int, NOT NULL) - Row (int, NOT NULL) - Number (int, NOT NULL) - SessionId (nvarchar(-1), NOT NULL) - ReservedAt (datetime2, NOT NULL) - ExpiresAt (datetime2, NOT NULL) - IsConfirmed (bit, NOT NULL) - UserId (nvarchar(-1), NULL)
## Table: Seats - Id (int, NOT NULL) - EventId (int, NOT NULL) - Row (nvarchar(-1), NOT NULL) - Number (int, NOT NULL) - IsReserved (bit, NOT NULL) - Height (decimal, NOT NULL) - Price (decimal, NOT NULL) - ReservedBy (nvarchar(-1), NULL) - ReservedUntil (datetime2, NULL) - SeatNumber (nvarchar(-1), NOT NULL) - Status (int, NOT NULL) - TableId (int, NULL) - Width (decimal, NOT NULL) - X (decimal, NOT NULL) - Y (decimal, NOT NULL) - TicketTypeId (int, NOT NULL)
## Table: TableReservations - Id (int, NOT NULL) - UserId (nvarchar(900), NOT NULL) - TableId (int, NOT NULL) - SeatsReserved (int, NOT NULL) - ReservedAt (datetime2, NOT NULL)
## Table: Tables - Id (int, NOT NULL) - EventId (int, NOT NULL) - TableNumber (nvarchar(-1), NOT NULL) - Capacity (int, NOT NULL) - Height (decimal, NOT NULL) - PricePerSeat (decimal, NOT NULL) - Shape (nvarchar(-1), NOT NULL) - TablePrice (decimal, NULL) - Width (decimal, NOT NULL) - X (decimal, NOT NULL) - Y (decimal, NOT NULL)
## Table: TicketTypes - Id (int, NOT NULL) - Type (nvarchar(-1), NOT NULL) - Price (decimal, NOT NULL) - Description (nvarchar(-1), NULL) - EventId (int, NOT NULL) - SeatRowAssignments (nvarchar(-1), NULL) - Color (nvarchar(-1), NOT NULL) - Name (nvarchar(-1), NULL)
## Table: Venues - Id (int, NOT NULL) - Name (nvarchar(-1), NOT NULL) - Description (nvarchar(-1), NOT NULL) - LayoutData (nvarchar(-1), NOT NULL) - Width (int, NOT NULL) - Height (int, NOT NULL) - Address (nvarchar(-1), NOT NULL) - City (nvarchar(-1), NOT NULL) - HasStaggeredSeating (bit, NOT NULL) - HasWheelchairSpaces (bit, NOT NULL) - LayoutType (nvarchar(-1), NOT NULL) - NumberOfRows (int, NOT NULL) - RowSpacing (int, NOT NULL) - SeatSpacing (int, NOT NULL) - SeatsPerRow (int, NOT NULL) - WheelchairSpaces (int, NOT NULL) - AisleWidth (int, NOT NULL) - HasHorizontalAisles (bit, NOT NULL) - HasVerticalAisles (bit, NOT NULL) - HorizontalAisleRows (nvarchar(-1), NOT NULL) - VerticalAisleSeats (nvarchar(-1), NOT NULL) - SeatSelectionMode (int, NOT NULL)



- Foreign Key: AspNetRoleClaims.RoleId ? AspNetRoles.Id
- Foreign Key: AspNetUserClaims.UserId ? AspNetUsers.Id
- Foreign Key: AspNetUserLogins.UserId ? AspNetUsers.Id
- Foreign Key: AspNetUserRoles.UserId ? AspNetUsers.Id
- Foreign Key: AspNetUserRoles.RoleId ? AspNetRoles.Id
- Foreign Key: AspNetUserTokens.UserId ? AspNetUsers.Id
- Foreign Key: BookingFoods.BookingId ? Bookings.Id
- Foreign Key: BookingFoods.FoodItemId ? FoodItems.Id
- Foreign Key: Bookings.EventId ? Events.Id
- Foreign Key: BookingTickets.BookingId ? Bookings.Id
- Foreign Key: BookingTickets.TicketTypeId ? TicketTypes.Id
- Foreign Key: Events.OrganizerId ? Organizers.Id
- Foreign Key: Events.VenueId ? Venues.Id
- Foreign Key: FoodItems.EventId ? Events.Id
- Foreign Key: Organizers.UserId ? AspNetUsers.Id
- Foreign Key: Payments.EventId ? Events.Id
- Foreign Key: Reservations.UserId ? AspNetUsers.Id
- Foreign Key: Reservations.EventId ? Events.Id
- Foreign Key: SeatReservations.EventId ? Events.Id
- Foreign Key: Seats.EventId ? Events.Id
- Foreign Key: Seats.TableId ? Tables.Id
- Foreign Key: Seats.TicketTypeId ? TicketTypes.Id
- Foreign Key: TableReservations.UserId ? AspNetUsers.Id
- Foreign Key: TableReservations.TableId ? Tables.Id
- Foreign Key: Tables.EventId ? Events.Id
- Foreign Key: TicketTypes.EventId ? Events.Id