using Microsoft.AspNetCore.Mvc;
using RentHub.Application.Bookings;
using RentHub.Application.Common;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;
using RentHub.Application.Properties;

namespace RentHub.Api.Endpoints;

public static class BookingEndpoints
{
    public static void MapBookingEndpoints(this IEndpointRouteBuilder app)
    {
        var bookings = app.MapGroup("/api/bookings").WithTags("Bookings").RequireAuthorization();

        bookings.MapPost("/", async (
            CreateBookingRequest request,
            BookingService service,
            ICurrentUser current,
            CancellationToken ct) =>
        {
            var userId = current.UserId ?? throw new UnauthorizedException("Authentication required.");
            var result = await service.CreateAsync(userId, request, ct);
            return Results.Created($"/api/bookings/{result.Id}", result);
        });

        bookings.MapGet("/me", async (BookingService service, ICurrentUser current, CancellationToken ct) =>
        {
            var userId = current.UserId ?? throw new UnauthorizedException("Authentication required.");
            var result = await service.GetMineAsync(userId, ct);
            return Results.Ok(result);
        });

        var favorites = app.MapGroup("/api/favorites").WithTags("Favorites").RequireAuthorization();

        favorites.MapGet("/", async (FavoriteService service, ICurrentUser current, CancellationToken ct) =>
        {
            var userId = current.UserId ?? throw new UnauthorizedException("Authentication required.");
            var result = await service.GetMineAsync(userId, ct);
            return Results.Ok(result);
        });

        favorites.MapPost("/{propertyId:guid}", async (
            Guid propertyId,
            FavoriteService service,
            ICurrentUser current,
            CancellationToken ct) =>
        {
            var userId = current.UserId ?? throw new UnauthorizedException("Authentication required.");
            await service.AddAsync(userId, propertyId, ct);
            return Results.NoContent();
        });

        favorites.MapDelete("/{propertyId:guid}", async (
            Guid propertyId,
            FavoriteService service,
            ICurrentUser current,
            CancellationToken ct) =>
        {
            var userId = current.UserId ?? throw new UnauthorizedException("Authentication required.");
            await service.RemoveAsync(userId, propertyId, ct);
            return Results.NoContent();
        });
    }
}
