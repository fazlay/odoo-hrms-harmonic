# Adding Custom Location Fields to Odoo HR Attendance

## Overview
To enable location tracking in the attendance system, you need to add custom fields to the `hr.attendance` model in your Odoo instance.

## Required Custom Fields

Add the following 4 fields to the `hr.attendance` model:

| Field Name | Field Type | Label | Description |
|------------|-----------|-------|-------------|
| `x_latitude_in` | Float | Check-in Latitude | Latitude coordinate when employee checks in |
| `x_longitude_in` | Float | Check-in Longitude | Longitude coordinate when employee checks in |
| `x_latitude_out` | Float | Check-out Latitude | Latitude coordinate when employee checks out |
| `x_longitude_out` | Float | Check-out Longitude | Longitude coordinate when employee checks out |

> **Note:** Odoo prefixes custom fields with `x_` automatically when created through the UI.

## Method 1: Add Fields via Odoo UI (Recommended for Non-Developers)

1. **Navigate to Settings**
   - Log in to Odoo as Administrator
   - Go to **Settings** → **Technical** → **Database Structure** → **Models**

2. **Find HR Attendance Model**
   - Search for `hr.attendance`
   - Click on the model to open it

3. **Add Custom Fields**
   - Click on the **Fields** tab
   - Click **Create** to add a new field
   - Add each of the 4 fields with these settings:

   **Field 1: Check-in Latitude**
   - Field Name: `x_latitude_in`
   - Field Label: `Check-in Latitude`
   - Field Type: `Float`
   - Click **Save**

   **Field 2: Check-in Longitude**
   - Field Name: `x_longitude_in`
   - Field Label: `Check-in Longitude`
   - Field Type: `Float`
   - Click **Save**

   **Field 3: Check-out Latitude**
   - Field Name: `x_latitude_out`
   - Field Label: `Check-out Latitude`
   - Field Type: `Float`
   - Click **Save**

   **Field 4: Check-out Longitude**
   - Field Name: `x_longitude_out`
   - Field Label: `Check-out Longitude`
   - Field Type: `Float`
   - Click **Save**

## Method 2: Add Fields via Custom Module (Recommended for Developers)

Create a custom Odoo module with the following structure:

```
hr_attendance_location/
├── __init__.py
├── __manifest__.py
└── models/
    ├── __init__.py
    └── hr_attendance.py
```

**__manifest__.py**
```python
{
    'name': 'HR Attendance Location Tracking',
    'version': '1.0',
    'category': 'Human Resources',
    'summary': 'Add GPS location tracking to attendance',
    'depends': ['hr_attendance'],
    'data': [],
    'installable': True,
    'application': False,
}
```

**models/__init__.py**
```python
from . import hr_attendance
```

**models/hr_attendance.py**
```python
from odoo import models, fields

class HrAttendance(models.Model):
    _inherit = 'hr.attendance'

    x_latitude_in = fields.Float(
        string='Check-in Latitude',
        help='Latitude coordinate when employee checks in'
    )
    x_longitude_in = fields.Float(
        string='Check-in Longitude',
        help='Longitude coordinate when employee checks in'
    )
    x_latitude_out = fields.Float(
        string='Check-out Latitude',
        help='Latitude coordinate when employee checks out'
    )
    x_longitude_out = fields.Float(
        string='Check-out Longitude',
        help='Longitude coordinate when employee checks out'
    )
```

Then:
1. Place the module in your Odoo addons directory
2. Update the apps list
3. Install the module

## After Adding Fields

Once the fields are added to Odoo, update your React Native app:

1. **Update constants.ts** to include the new fields:
```typescript
export const ATTENDANCE_FIELDS = {
  BASIC: [
    "employee_id",
    "check_in",
    "check_out",
    "x_latitude_in",
    "x_longitude_in",
    "x_latitude_out",
    "x_longitude_out",
  ],
  DETAILED: [
    "employee_id",
    "check_in",
    "check_out",
    "x_latitude_in",
    "x_longitude_in",
    "x_latitude_out",
    "x_longitude_out",
  ],
  ALL: [],
} as const;
```

2. **Update type.ts** to use the correct field names:
```typescript
export interface Attendance {
  id: number;
  employee_id: number;
  check_in: string;
  check_out?: string;
  x_latitude_in?: number;
  x_longitude_in?: number;
  x_latitude_out?: number;
  x_longitude_out?: number;
}
```

3. **Update service interfaces** in attendance.service.ts:
```typescript
export interface CreateAttendanceData {
  employee_id: number;
  check_in: string;
  check_out?: string;
  x_latitude_in?: number;
  x_longitude_in?: number;
}

export interface UpdateAttendanceData {
  check_in?: string;
  check_out?: string;
  x_latitude_out?: number;
  x_longitude_out?: number;
}
```

4. **Update AttendanceButton.tsx** to use the correct field names:
```typescript
// For check-in
await attendanceService.createAttendance(client, {
    employee_id: EMPLOYEE_ID,
    check_in: now,
    x_latitude_in: coords?.latitude,
    x_longitude_in: coords?.longitude,
});

// For check-out
await attendanceService.updateAttendance(client, currentAttendance.id, {
    check_out: now,
    x_latitude_out: coords?.latitude,
    x_longitude_out: coords?.longitude,
});
```

## Verification

After setup, verify the fields are working:
1. Check in from the mobile app
2. Go to Odoo → Attendance → Attendances
3. Open the attendance record
4. You should see the latitude and longitude values populated

## Troubleshooting

**Error: "Invalid field 'x_latitude_in' on model 'hr.attendance'"**
- The custom fields haven't been created in Odoo yet
- Follow Method 1 or Method 2 above to add the fields

**Location values are null/empty**
- Check if location permissions are granted on the mobile device
- Ensure you're testing on a physical device (not simulator)
- Check the browser console for location-related errors
