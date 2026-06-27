namespace RentHub.Application.Common.Dtos;

public record RegisterRequest(string Email, string Password, string FullName, string Role);

public record LoginRequest(string Email, string Password);

public record CreateBookingRequest(Guid PropertyId, DateOnly From, DateOnly To, int Guests);

public record CreatePropertyRequest(
    string Title,
    string City,
    string Country,
    decimal PricePerNight,
    int Beds,
    int Baths,
    int MaxGuests,
    IReadOnlyList<string> Images,
    IReadOnlyList<string> Tags);

public record PropertySearchQuery(string? City, DateOnly? From, DateOnly? To);
