<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{

    use HasFactory;
    protected $fillable = [
        'title',           
        'description',     
        'date',            
        'time',            
        'location',        
        'performer',       
        'price',           
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}