CRUD Users & Auth

# Auth
## Register a new user
### Request
`POST /api/v1/signUp`
#### Body
```json
{
  "email": "string",
  "password": "string",
  "name": "string",
  "mobile_number": "number"
}
```

### Response
```json
{
  "message": "string",
  "data": {
    "id": "number",
    "email": "string",
    "name": "string",
    "mobile_number": "number",
    "created_at": "string",
    "updated_at": "string"
  }
}
```