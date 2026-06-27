namespace RentHub.Domain.ValueObjects;

public readonly record struct DateRange
{
    public DateOnly From { get; }
    public DateOnly To { get; }

    public DateRange(DateOnly from, DateOnly to)
    {
        if (to <= from)
            throw new ArgumentException("The end date must be after the start date.");

        From = from;
        To = to;
    }

    public int Nights => To.DayNumber - From.DayNumber;

    public bool Overlaps(DateRange other) => From < other.To && other.From < To;

    public bool Overlaps(DateOnly otherFrom, DateOnly otherTo) =>
        From < otherTo && otherFrom < To;
}
