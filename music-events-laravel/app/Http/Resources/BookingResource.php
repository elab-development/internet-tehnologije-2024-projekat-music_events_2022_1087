<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'number_of_tickets' => $this->number_of_tickets,
            'total_price' => $this->total_price,
            'user_id' => $this->user_id, 
            'event_id' => $this->event_id, 
            'review' => $this->review ? $this->review->id : null, 
        ];
    }
}
