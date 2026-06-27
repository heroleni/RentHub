using Microsoft.EntityFrameworkCore;
using RentHub.Application.Common.Interfaces;
using RentHub.Domain.Entities;
using RentHub.Infrastructure.Notifications;

namespace RentHub.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<PropertyTag> PropertyTags => Set<PropertyTag>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<KycVerification> KycVerifications => Set<KycVerification>();
    public DbSet<InAppNotification> Notifications => Set<InAppNotification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        modelBuilder.Entity<InAppNotification>().ToTable("notifications");
        base.OnModelCreating(modelBuilder);
    }

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => base.SaveChangesAsync(ct);
}
