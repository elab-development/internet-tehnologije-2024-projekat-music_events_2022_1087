<?php

namespace App\Exports;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class BookingExport implements FromCollection, WithHeadings
{
    /**
     * Get the collection of bookings with full details.
     *
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Booking::with(['user', 'event'])
            ->get()
            //pretvaranje svakog bookinga u niz
            ->map(function ($booking) {
                return [
                    'ID' => $booking->id,
                    'Number of Tickets' => $booking->number_of_tickets,
                    'Total Price' => $booking->total_price,
                    'User Name' => $booking->user->name,
                    'User Email' => $booking->user->email,
                    'Event Title' => $booking->event->title,
                    'Event Description' => $booking->event->description,
                    'Event Date' => $booking->event->date,
                    'Event Time' => $booking->event->time,
                    'Event Location' => $booking->event->location,
                    'Event Performer' => $booking->event->performer,
                    'Event Type' => $booking->event->type,
                    'Event Price' => $booking->event->price,
                ];
            });
    }

    /**
     * Define the headings for the exported Excel file.
     *
     * @return array
     */
    public function headings(): array
    {
        return [
            'ID',
            'Number of Tickets',
            'Total Price',
            'User Name',
            'User Email',
            'Event Title',
            'Event Description',
            'Event Date',
            'Event Time',
            'Event Location',
            'Event Performer',
            'Event Type',
            'Event Price',
        ];
    }
}
