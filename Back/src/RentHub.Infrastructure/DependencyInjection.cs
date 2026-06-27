using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RentHub.Application.Common.Interfaces;
using RentHub.Infrastructure.Export;
using RentHub.Infrastructure.Kyc;
using RentHub.Infrastructure.Notifications;
using RentHub.Infrastructure.Persistence;
using RentHub.Infrastructure.Security;

namespace RentHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(config.GetConnectionString("Default")));

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddScoped<IPropertyRepository, PropertyRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        services.AddScoped<IKycRepository, KycRepository>();
        services.AddScoped<RentHub.Application.Admin.IAdminRepository, AdminRepository>();

        services.AddScoped<IKycService, StubKycService>();

        // Email / SMTP
        services.Configure<SmtpOptions>(config.GetSection(SmtpOptions.SectionName));
        services.AddSingleton<IEmailSender, SmtpEmailSender>();

        services.AddScoped<INotificationService, NotificationService>();
        services.AddSingleton<IExcelExporter, ExcelExporter>();

        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();

        var jwt = new JwtOptions();
        config.GetSection("Jwt").Bind(jwt);
        services.AddSingleton(jwt);
        services.AddSingleton<ITokenService, TokenService>();

        return services;
    }
}
