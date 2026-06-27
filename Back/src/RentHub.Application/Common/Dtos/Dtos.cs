namespace RentHub.Application.Common.Dtos;

public record PropertyDto(
    Guid Id,
    string Title,
    string City,
    string Country,
    decimal PricePerNight,
    double Rating,
    int Reviews,
    int Beds,
    int Baths,
    int Guests,
    IReadOnlyList<string> Images,
    string HostName,
    IReadOnlyList<DateRangeDto> BlockedRanges,
    IReadOnlyList<string> Tags);

public record DateRangeDto(DateOnly From, DateOnly To);

public record BookingDto(
    Guid Id,
    Guid PropertyId,
    string PropertyTitle,
    string City,
    string Image,
    DateOnly CheckIn,
    DateOnly CheckOut,
    int Guests,
    decimal Total,
    string Status);

public record KycResultDto(
    string Status,
    string? Names,
    string? LastNames,
    string? DocumentNumber,
    DateOnly? BirthDate,
    string? Reason);

public record OwnerPropertyDto(
    Guid Id,
    string Title,
    string City,
    string Country,
    decimal PricePerNight,
    double Rating,
    int Reviews,
    int Beds,
    int Baths,
    int Guests,
    IReadOnlyList<string> Images,
    string HostName,
    IReadOnlyList<DateRangeDto> BlockedRanges,
    IReadOnlyList<string> Tags,
    double OccupancyRate,
    decimal MonthlyRevenue,
    int NightsBooked);

public record AuthResultDto(string Token, string Email, string FullName, string Role, string KycStatus);

public record BookingReportRow(
    string PropertyTitle,
    string GuestName,
    DateOnly CheckIn,
    DateOnly CheckOut,
    decimal Total);

public record AdminStatsDto(
    int TotalProperties,
    int TotalUsers,
    decimal TotalRevenue,
    int ActiveBookings,
    int KycApproved,
    int KycPending);

public record AdminPropertyDto(
    Guid Id,
    string Title,
    string City,
    string Country,
    decimal PricePerNight,
    double Rating,
    int Reviews,
    int Beds,
    int Baths,
    int Guests,
    IReadOnlyList<string> Images,
    string HostName,
    IReadOnlyList<DateRangeDto> BlockedRanges,
    IReadOnlyList<string> Tags,
    double OccupancyRate,
    decimal MonthlyRevenue,
    int NightsBooked,
    bool IsActive);
