using RentHub.Application.Common;
using RentHub.Application.Common.Dtos;
using RentHub.Application.Common.Interfaces;

namespace RentHub.Application.Properties;

public class PropertyService
{
    private readonly IPropertyRepository _properties;

    public PropertyService(IPropertyRepository properties)
    {
        _properties = properties;
    }

    public async Task<IReadOnlyList<PropertyDto>> SearchAsync(PropertySearchQuery query, CancellationToken ct = default)
    {
        var result = await _properties.SearchAsync(query, ct);
        return result.Select(p => p.ToDto()).ToList();
    }

    public async Task<PropertyDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var property = await _properties.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Property not found.");
        return property.ToDto();
    }
}
