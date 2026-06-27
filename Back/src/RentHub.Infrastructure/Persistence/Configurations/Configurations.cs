using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using RentHub.Domain.Entities;

namespace RentHub.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(u => u.Id);
        builder.HasIndex(u => u.Email).IsUnique();
        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.Property(u => u.FullName).HasMaxLength(200).IsRequired();
        builder.Property(u => u.PasswordHash).IsRequired();
        builder.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
        builder.Property(u => u.KycStatus).HasConversion<string>().HasMaxLength(20);
    }
}

public class PropertyConfiguration : IEntityTypeConfiguration<Property>
{
    public void Configure(EntityTypeBuilder<Property> builder)
    {
        builder.ToTable("properties");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Title).HasMaxLength(200).IsRequired();
        builder.Property(p => p.City).HasMaxLength(120).IsRequired();
        builder.Property(p => p.Country).HasMaxLength(120).IsRequired();
        builder.Property(p => p.PricePerNight).HasColumnType("numeric(12,2)");

        builder.HasOne(p => p.Owner)
            .WithMany()
            .HasForeignKey(p => p.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Images)
            .WithOne()
            .HasForeignKey(i => i.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Tags)
            .WithOne()
            .HasForeignKey(t => t.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Bookings)
            .WithOne(b => b.Property)
            .HasForeignKey(b => b.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class PropertyImageConfiguration : IEntityTypeConfiguration<PropertyImage>
{
    public void Configure(EntityTypeBuilder<PropertyImage> builder)
    {
        builder.ToTable("property_images");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Url).IsRequired();
    }
}

public class PropertyTagConfiguration : IEntityTypeConfiguration<PropertyTag>
{
    public void Configure(EntityTypeBuilder<PropertyTag> builder)
    {
        builder.ToTable("property_tags");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Label).HasMaxLength(80).IsRequired();
    }
}

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable("bookings");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Total).HasColumnType("numeric(12,2)");
        builder.Property(b => b.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(b => b.User)
            .WithMany(u => u.Bookings)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(b => new { b.PropertyId, b.CheckInDate, b.CheckOutDate });
    }
}

public class FavoriteConfiguration : IEntityTypeConfiguration<Favorite>
{
    public void Configure(EntityTypeBuilder<Favorite> builder)
    {
        builder.ToTable("favorites");
        builder.HasKey(f => f.Id);
        builder.HasIndex(f => new { f.UserId, f.PropertyId }).IsUnique();

        builder.HasOne(f => f.Property)
            .WithMany()
            .HasForeignKey(f => f.PropertyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class KycVerificationConfiguration : IEntityTypeConfiguration<KycVerification>
{
    public void Configure(EntityTypeBuilder<KycVerification> builder)
    {
        builder.ToTable("kyc_verifications");
        builder.HasKey(k => k.Id);
        builder.Property(k => k.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(k => k.Names).HasMaxLength(200);
        builder.Property(k => k.LastNames).HasMaxLength(200);
        builder.Property(k => k.DocumentNumber).HasMaxLength(50);
    }
}
