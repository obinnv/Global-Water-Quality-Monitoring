import { describe, it, beforeEach, expect } from "vitest"

describe("Sensor Network Contract", () => {
  let mockStorage: Map<string, any>
  let nextSensorId: number
  let currentBlockHeight: number
  
  beforeEach(() => {
    mockStorage = new Map()
    nextSensorId = 0
    currentBlockHeight = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "register-sensor":
        const [location, sensorType] = args
        nextSensorId++
        mockStorage.set(`sensor-${nextSensorId}`, {
          location,
          sensor_type: sensorType,
          last_reading: null,
        })
        return { success: true, value: nextSensorId }
      
      case "record-reading":
        const [sensorId, value] = args
        const sensor = mockStorage.get(`sensor-${sensorId}`)
        if (!sensor) return { success: false, error: 404 }
        sensor.last_reading = {
          timestamp: currentBlockHeight,
          value,
        }
        mockStorage.set(`sensor-${sensorId}`, sensor)
        return { success: true }
      
      case "get-sensor-info":
        return { success: true, value: mockStorage.get(`sensor-${args[0]}`) }
      
      case "get-last-reading":
        const sensorInfo = mockStorage.get(`sensor-${args[0]}`)
        if (!sensorInfo) return { success: false, error: 404 }
        return { success: true, value: sensorInfo.last_reading }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should register a sensor", () => {
    const result = mockContractCall("register-sensor", ["New York City", "pH"], "user1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should record a reading", () => {
    mockContractCall("register-sensor", ["New York City", "pH"], "user1")
    currentBlockHeight = 100
    const result = mockContractCall("record-reading", [1, 70], "user2")
    expect(result.success).toBe(true)
  })
  
  it("should not record a reading for non-existent sensor", () => {
    const result = mockContractCall("record-reading", [999, 70], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(404)
  })
  
  it("should get sensor info", () => {
    mockContractCall("register-sensor", ["New York City", "pH"], "user1")
    const result = mockContractCall("get-sensor-info", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      location: "New York City",
      sensor_type: "pH",
      last_reading: null,
    })
  })
  
  it("should get last reading", () => {
    mockContractCall("register-sensor", ["New York City", "pH"], "user1")
    currentBlockHeight = 100
    mockContractCall("record-reading", [1, 70], "user2")
    const result = mockContractCall("get-last-reading", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      timestamp: 100,
      value: 70,
    })
  })
})

