# Edit the price and name for each product before running
$products = @(
    @{ name = "Huile d'Olive Extra Vierge 0.5L"; price = 25;  size = "0.5L"; image = "product-0,5.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 1L";   price = 40; size = "1L";   image = "product-1.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 2L";   price = 75; size = "2L";   image = "product-2.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 3L";   price = 115; size = "3L";   image = "product-3.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 5L";   price = 185; size = "5L";   image = "product-5.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 30L";  price = 1000; size = "30L"; image = "product-30.jpg" }
)

foreach ($p in $products) {
    $imageUrl = "http://localhost:5000/uploads/products/$($p.image)"
    $body = @{
        name = $p.name
        price = $p.price
        priceDisplay = "$($p.price) DH"
        size = $p.size
        description = "Huile d'olive extra vierge bio, pressee a froid"
        image = $imageUrl
        inStock = $true
    } | ConvertTo-Json

    Write-Host "Adding: $($p.name)..."
    Invoke-RestMethod -Uri "http://localhost:5000/api/products" -Method Post -ContentType "application/json" -Body $body
    Write-Host "---"
}
