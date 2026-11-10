<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_scan_barcode_page_returns_a_successful_response(): void
    {
        $response = $this->get('/scan-barcode');

        $response->assertStatus(200);
        $response->assertSee('DARKIM');
    }

    public function test_katalog_page_returns_a_successful_response(): void
    {
        $response = $this->get('/katalog');

        $response->assertStatus(200);
        $response->assertSee('Ultra Milk 250ml');
        $response->assertSee('ALL CATEGORIES');
    }

    public function test_product_detail_page_returns_a_successful_response(): void
    {
        $response = $this->get('/produk/ultra-milk');

        $response->assertStatus(200);
        $response->assertSee('KEMBALI KE KATALOG');
        $response->assertSee('Diabetes');
        $response->assertSee('Hipertensi');
    }
}
