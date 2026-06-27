namespace RentHub.Domain.Enums;

public enum Role
{
    Guest,
    Owner,
    Admin
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Completed,
    Cancelled
}

public enum KycStatus
{
    Unstarted,
    Processing,
    Approved,
    Rejected
}
