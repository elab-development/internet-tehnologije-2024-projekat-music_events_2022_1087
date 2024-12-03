<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{

    use HasFactory;
    
    protected $fillable = [
        'user_id',         
        'event_id',        
        'number_of_tickets', 
        'total_price',     
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    //racunanje ukupne cene rezervacije tako sto se mnozi cena karte i broj karata
    public function getTotalPriceAttribute()
    {
        return $this->event->price * $this->number_of_tickets;
    }
}
