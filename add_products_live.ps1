# Live backend URL
$baseUrl = "https://acceptable-bravery-production-302d.up.railway.app"

# ---- Step 1: Log in as admin to get a token ----
# Replace with your real admin email/password
$loginBody = @{
    email = "tata@gmail.com"
    password = "12345678"
} | ConvertTo-Json

Write-Host "Logging in..."
$login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$token = $login.token

if (-not $token) {
    Write-Host "Login failed - check email/password. Stopping."
    exit
}
Write-Host "Logged in successfully."

# ---- Step 2: Add products ----
$products = @(
    @{ name = "Huile d'Olive Extra Vierge 0.5L"; price = 25;  size = "0.5L"; image = "product-0,5.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 1L";   price = 40; size = "1L";   image = "product-1.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 2L";   price = 75; size = "2L";   image = "product-2.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 3L";   price = 115; size = "3L";   image = "product-3.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 5L";   price = 185; size = "5L";   image = "product-5.jpg" },
    @{ name = "Huile d'Olive Extra Vierge 30L";  price = 1000; size = "30L"; image = "product-30.jpg" }
)

foreach ($p in $products) {
    $imageUrl = "$baseUrl/uploads/products/$($p.image)"
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
    Invoke-RestMethod -Uri "$baseUrl/api/products" -Method Post -ContentType "application/json" -Headers @{Authorization = "Bearer $token"} -Body $body
    Write-Host "---"
}
