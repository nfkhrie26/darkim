@props([
    'title' => 'DARKIM - Lihat Informasi Makanan dan Minuman Sebelum Konsumsi',
])
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>

    <!-- Google Fonts for sharp neo-brutalist typography -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800;900&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-[#E6F1EA] text-black font-sans min-h-screen p-3 sm:p-6 lg:p-8 flex flex-col justify-start selection:bg-[#FFD027] selection:text-black">

    {{ $slot }}

</body>
</html>

