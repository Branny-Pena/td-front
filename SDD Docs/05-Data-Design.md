# 05 Data Design

## Core entities

### Customer
- id (UUID)
- firstName
- lastName
- dni
- phoneNumber
- email

### Vehicle
- id (UUID)
- make
- model
- color
- location
- licensePlate
- vinNumber (nullable)
- registerStatus: in progress | confirmed

### TestDriveForm
- id (UUID)
- brand: MERCEDES-BENZ | ANDES MOTOR | STELLANTIS
- status: draft | pending | submitted
- currentStep
- purchaseProbability
- estimatedPurchaseDate (string)
- observations
- customerId (FK)
- vehicleId (FK)
- signature (FK)
- returnState (FK)

### DigitalSignature
- id
- signatureData (data URL)

### ReturnState
- id
- mileageImage (image role: mileage)
- fuelLevelImage (image role: fuel_level)
- images[] (role: vehicle)

### Image
- id
- url
- role
- returnStateId

### Survey
- id
- name
- brand
- isActive
- status: draft | ready

### SurveyVersion
- id
- version
- isCurrent
- notes
- surveyId

### SurveyQuestion
- id
- type: number | text | option_single | option_multi
- label
- isRequired
- orderIndex
- minValue
- maxValue

### SurveyQuestionOption
- id
- label
- value
- orderIndex

### SurveyResponse
- id
- status: started | submitted
- submittedAt
- surveyVersionId
- testDriveFormId

### SurveyAnswer
- id
- valueNumber
- valueText
- surveyQuestionId
- surveyQuestionOptionId (nullable)

## Relationships
- Customer 1:N TestDriveForm
- Vehicle 1:N TestDriveForm
- TestDriveForm 1:1 DigitalSignature
- TestDriveForm 1:1 ReturnState
- ReturnState 1:N Image
- Survey 1:N SurveyVersion
- SurveyVersion 1:N SurveyQuestion
- SurveyQuestion 1:N SurveyQuestionOption
- SurveyVersion 1:N SurveyResponse
- SurveyResponse 1:N SurveyAnswer

## Data constraints
- SurveyVersion immutable after responses exist.
- SurveyResponse immutable after submission.
- ReturnState: 1..3 vehicle images, total size <= 2 MB.
- signatureData and images stored as data URLs.

## Indexing strategy
- test_drive_forms: status, brand, customerId, vehicleId
- vehicles: licensePlate, vinNumber, location
- survey_responses: status, surveyVersionId, testDriveFormId
