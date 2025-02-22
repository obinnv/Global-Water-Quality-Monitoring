;; Sensor Network Contract

(define-data-var next-sensor-id uint u0)

(define-map sensors
  { sensor-id: uint }
  {
    location: (string-ascii 64),
    sensor-type: (string-ascii 32),
    last-reading: (optional {
      timestamp: uint,
      value: uint
    })
  }
)

(define-public (register-sensor (location (string-ascii 64)) (sensor-type (string-ascii 32)))
  (let
    ((sensor-id (+ (var-get next-sensor-id) u1)))
    (var-set next-sensor-id sensor-id)
    (ok (map-set sensors
      { sensor-id: sensor-id }
      {
        location: location,
        sensor-type: sensor-type,
        last-reading: none
      }
    ))
  )
)

(define-public (record-reading (sensor-id uint) (value uint))
  (let
    ((sensor (unwrap! (map-get? sensors { sensor-id: sensor-id }) (err u404))))
    (ok (map-set sensors
      { sensor-id: sensor-id }
      (merge sensor {
        last-reading: (some {
          timestamp: block-height,
          value: value
        })
      })
    ))
  )
)

(define-read-only (get-sensor-info (sensor-id uint))
  (map-get? sensors { sensor-id: sensor-id })
)

(define-read-only (get-last-reading (sensor-id uint))
  (get last-reading (unwrap! (map-get? sensors { sensor-id: sensor-id }) (err u404)))
)

