# Test the TOS comparison API
$uri = "http://localhost:5000/api/compare-comprehensive"
$file1Path = "test-file1.txt"
$file2Path = "test-file2.txt"

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file1`"; filename=`"test-file1.txt`"",
    "Content-Type: text/plain$LF",
    (Get-Content $file1Path -Raw),
    "--$boundary",
    "Content-Disposition: form-data; name=`"file2`"; filename=`"test-file2.txt`"",
    "Content-Type: text/plain$LF",
    (Get-Content $file2Path -Raw),
    "--$boundary--$LF"
) -join $LF

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    Write-Host "Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}
