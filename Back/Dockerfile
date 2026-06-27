FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY RentHub.sln ./
COPY src/RentHub.Domain/RentHub.Domain.csproj src/RentHub.Domain/
COPY src/RentHub.Application/RentHub.Application.csproj src/RentHub.Application/
COPY src/RentHub.Infrastructure/RentHub.Infrastructure.csproj src/RentHub.Infrastructure/
COPY src/RentHub.Api/RentHub.Api.csproj src/RentHub.Api/
RUN dotnet restore

COPY . .
RUN dotnet publish src/RentHub.Api/RentHub.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "RentHub.Api.dll"]
