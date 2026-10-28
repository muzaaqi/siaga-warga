import * as React from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateTimePickerProps {
  value: Date
  onChange: (date: Date) => void
  disabled?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelectDay = (selectedDay: Date | undefined) => {
    if (!selectedDay) return
    const updated = new Date(selectedDay)
    updated.setHours(value.getHours())
    updated.setMinutes(value.getMinutes())
    onChange(updated)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      const updated = new Date(value)
      updated.setHours(hours)
      updated.setMinutes(minutes)
      onChange(updated)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-between sm:max-w-xs"
          />
        }
      >
        <div className="flex items-center gap-2 text-foreground">
          <CalendarIcon className="size-4 text-muted-foreground" />
          <span>{format(value, 'd MMMM yyyy, HH:mm', { locale: id })} WIB</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelectDay}
          locale={id}
          disabled={(date) => date > new Date()}
        />
        <div className="flex items-center justify-between gap-3 border-t border-border p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" />
            <span>Waktu Kejadian:</span>
          </div>
          <Input
            type="time"
            value={format(value, 'HH:mm')}
            onChange={handleTimeChange}
            className="w-28"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
