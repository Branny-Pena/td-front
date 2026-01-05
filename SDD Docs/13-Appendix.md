# 13 Appendix

## Status mapping
| Status | Meaning |
|---|---|
| draft | In progress |
| pending | Completed but vehicle not confirmed |
| submitted | Finalized |

## Brand enum
- MERCEDES-BENZ
- ANDES MOTOR
- STELLANTIS

## Example QR payload
```
{"marca":"Toyota","modelo":"Corolla","color":"Rojo","placa":"ABC-123","vin":"JTDBE...","ubicacion":"Lima"}
```

## Sample survey answer payload
```json
{
  "answers": [
    { "questionId": "uuid", "valueNumber": 9 },
    { "questionId": "uuid", "optionIds": ["uuid"] },
    { "questionId": "uuid", "valueText": "Excelente" }
  ]
}
```
