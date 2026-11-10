<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::get('/scan-barcode', function () {
    return view('scan-barcode');
})->name('scan.barcode');

Route::get('/katalog', function () {
    return view('katalog');
})->name('katalog.index');

Route::get('/produk/{id}', function (string $id) {
    return view('detail-produk', ['productId' => $id]);
})->name('produk.show');
