using Microsoft.Extensions.DependencyInjection;
using RentHub.Application.Admin;
using RentHub.Application.Auth;
using RentHub.Application.Bookings;
using RentHub.Application.Kyc;
using RentHub.Application.Owner;
using RentHub.Application.Properties;

namespace RentHub.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<PropertyService>();
        services.AddScoped<FavoriteService>();
        services.AddScoped<BookingService>();
        services.AddScoped<KycService>();
        services.AddScoped<OwnerService>();
        services.AddScoped<AuthService>();
        services.AddScoped<AdminService>();
        return services;
    }
}
