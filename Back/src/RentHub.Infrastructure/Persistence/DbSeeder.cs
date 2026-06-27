using Microsoft.EntityFrameworkCore;
using RentHub.Domain.Entities;
using RentHub.Domain.Enums;
using RentHub.Domain.ValueObjects;

namespace RentHub.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        if (await db.Properties.AnyAsync())
            return;

        // ── Usuarios ──────────────────────────────────────────────
        var owner = new User(
            "anfitrion@renthub.co",
            BCrypt.Net.BCrypt.HashPassword("Owner123*"),
            "Daniela Restrepo",
            Role.Owner);

        var admin = new User(
            "admin@renthub.co",
            BCrypt.Net.BCrypt.HashPassword("Admin123*"),
            "Administrador RentHub",
            Role.Admin);

        var guest = new User(
            "huesped@renthub.co",
            BCrypt.Net.BCrypt.HashPassword("Guest123*"),
            "Camila Gómez",
            Role.Guest);
        guest.SetKycStatus(KycStatus.Approved);

        await db.Users.AddRangeAsync(owner, admin, guest);
        await db.SaveChangesAsync();

        // ── Propiedades ───────────────────────────────────────────
        var seed = new (string Title, string City, decimal Price, int Beds, int Baths, int Guests, string[] Tags)[]
        {
            ("Loft con vista al Poblado", "Medellín", 82m, 1, 1, 2, new[] { "WiFi 600Mb", "Balcón", "Pet friendly" }),
            ("Casa colonial en Cartagena", "Cartagena", 156m, 3, 2, 6, new[] { "Piscina", "Centro histórico", "A/C" }),
            ("Apartaestudio en Chapinero", "Bogotá", 64m, 1, 1, 2, new[] { "Cocina equipada", "Coworking", "Metro" }),
            ("Cabaña en el Eje Cafetero", "Salento", 110m, 2, 2, 4, new[] { "Chimenea", "Naturaleza", "Desayuno" }),
        };

        var properties = new List<Property>();
        var index = 1;
        foreach (var s in seed)
        {
            var property = new Property(owner.Id, s.Title, s.City, "Colombia", s.Price, s.Beds, s.Baths, s.Guests);

            for (var i = 0; i < 3; i++)
                property.Images.Add(new PropertyImage(property.Id, $"https://picsum.photos/seed/renthub{index}{i}/800/528", i));

            foreach (var tag in s.Tags)
                property.Tags.Add(new PropertyTag(property.Id, tag));

            properties.Add(property);
            await db.Properties.AddAsync(property);
            index++;
        }

        await db.SaveChangesAsync();

        // ── Reservas de ejemplo (para que las métricas no salgan en cero) ──
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var bookings = new[]
        {
            Booking.Create(properties[1].Id, guest.Id,
                new DateRange(today.AddDays(5), today.AddDays(9)), 4, properties[1].PricePerNight, 0.08m),
            Booking.Create(properties[3].Id, guest.Id,
                new DateRange(today.AddDays(-20), today.AddDays(-17)), 2, properties[3].PricePerNight, 0.08m),
        };
        bookings[1].Complete();

        await db.Bookings.AddRangeAsync(bookings);
        await db.SaveChangesAsync();
    }
}
