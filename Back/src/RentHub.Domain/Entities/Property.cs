namespace RentHub.Domain.Entities;

public class Property
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid OwnerId { get; private set; }
    public string Title { get; private set; } = null!;
    public string City { get; private set; } = null!;
    public string Country { get; private set; } = null!;
    public decimal PricePerNight { get; private set; }
    public int Beds { get; private set; }
    public int Baths { get; private set; }
    public int MaxGuests { get; private set; }
    public double Rating { get; private set; }
    public int Reviews { get; private set; }
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    public User Owner { get; private set; } = null!;
    public ICollection<PropertyImage> Images { get; private set; } = new List<PropertyImage>();
    public ICollection<PropertyTag> Tags { get; private set; } = new List<PropertyTag>();
    public ICollection<Booking> Bookings { get; private set; } = new List<Booking>();

    private Property() { }

    public Property(
        Guid ownerId,
        string title,
        string city,
        string country,
        decimal pricePerNight,
        int beds,
        int baths,
        int maxGuests)
    {
        OwnerId = ownerId;
        Title = title;
        City = city;
        Country = country;
        PricePerNight = pricePerNight;
        Beds = beds;
        Baths = baths;
        MaxGuests = maxGuests;
    }

    public void Update(string title, decimal pricePerNight, int beds, int baths, int maxGuests)
    {
        Title = title;
        PricePerNight = pricePerNight;
        Beds = beds;
        Baths = baths;
        MaxGuests = maxGuests;
    }
}

public class PropertyImage
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid PropertyId { get; private set; }
    public string Url { get; private set; } = null!;
    public int Position { get; private set; }

    private PropertyImage() { }

    public PropertyImage(Guid propertyId, string url, int position)
    {
        PropertyId = propertyId;
        Url = url;
        Position = position;
    }
}

public class PropertyTag
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid PropertyId { get; private set; }
    public string Label { get; private set; } = null!;

    private PropertyTag() { }

    public PropertyTag(Guid propertyId, string label)
    {
        PropertyId = propertyId;
        Label = label;
    }
}
