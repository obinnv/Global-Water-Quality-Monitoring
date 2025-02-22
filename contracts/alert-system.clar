;; Alert System Contract

(define-constant CONTRACT_OWNER tx-sender)

(define-map alert-thresholds
  { sensor-type: (string-ascii 32) }
  { threshold: uint }
)

(define-map active-alerts
  { sensor-id: uint }
  {
    alert-type: (string-ascii 32),
    timestamp: uint
  }
)

(define-public (set-alert-threshold (sensor-type (string-ascii 32)) (threshold uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) (err u403))
    (ok (map-set alert-thresholds
      { sensor-type: sensor-type }
      { threshold: threshold }
    ))
  )
)

(define-public (check-and-issue-alert (sensor-id uint))
  (let
    ((sensor-info (unwrap! (contract-call? .sensor-network get-sensor-info sensor-id) (err u404)))
     (last-reading (unwrap! (contract-call? .sensor-network get-last-reading sensor-id) (err u404)))
     (threshold (unwrap! (get threshold (map-get? alert-thresholds { sensor-type: (get sensor-type sensor-info) })) (err u404))))
    (if (> (get value last-reading) threshold)
      (ok (map-set active-alerts
        { sensor-id: sensor-id }
        {
          alert-type: "High Level",
          timestamp: block-height
        }
      ))
      (ok true)
    )
  )
)

(define-read-only (get-active-alert (sensor-id uint))
  (map-get? active-alerts { sensor-id: sensor-id })
)

