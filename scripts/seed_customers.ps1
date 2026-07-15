param(
  [Parameter(Mandatory = $true)][string]$Endpoint,
  [Parameter(Mandatory = $true)][string]$ApiKey
)

$customers = @(
  @{ customer_id='C001'; full_name='คุณมินท์'; phone='0812457810'; service_interest='Botox กราม'; status='ด่วน'; last_visit_date='2026-07-14'; next_followup='2026-07-15 10:30' },
  @{ customer_id='C002'; full_name='คุณอร'; phone='0893104421'; service_interest='เลเซอร์เส้นเลือดขอด'; status='รอติดตาม'; last_visit_date='2026-07-10'; next_followup='2026-07-15 13:00' },
  @{ customer_id='C003'; full_name='คุณก้อย'; phone='0867781290'; service_interest='Filler ใต้ตา'; status='รอติดตาม'; last_visit_date='2026-07-12'; next_followup='2026-07-15 15:30' },
  @{ customer_id='C004'; full_name='คุณเมย์'; phone='0924518803'; service_interest='ทรีตเมนต์ผิว'; status='เกินกำหนด'; last_visit_date='2026-07-07'; next_followup='2026-07-14' },
  @{ customer_id='C005'; full_name='คุณนภา'; phone='0956321744'; service_interest='Botox หน้าผาก'; status='นัดแล้ว'; last_visit_date='2026-07-15'; next_followup='2026-07-22' },
  @{ customer_id='C006'; full_name='คุณใบเตย'; phone='0829045172'; service_interest='ปรึกษา Filler'; status='รอยืนยัน'; last_visit_date='2026-07-15'; next_followup='2026-07-18' },
  @{ customer_id='C007'; full_name='คุณจูน'; phone='0992076531'; service_interest='ติดตามผล Botox'; status='นัดแล้ว'; last_visit_date='2026-07-08'; next_followup='2026-07-15 14:00' },
  @{ customer_id='C008'; full_name='คุณน้ำ'; phone='0846634908'; service_interest='ทรีตเมนต์ผิว'; status='นัดแล้ว'; last_visit_date='2026-07-13'; next_followup='2026-07-20' },
  @{ customer_id='C009'; full_name='คุณแพรว'; phone='0961147823'; service_interest='Filler ปาก'; status='รอติดตาม'; last_visit_date='2026-07-11'; next_followup='2026-07-25' },
  @{ customer_id='C010'; full_name='คุณปุ้ย'; phone='0805372619'; service_interest='เลเซอร์ขน'; status='สำเร็จ'; last_visit_date='2026-07-09'; next_followup='เสร็จแล้ว' },
  @{ customer_id='C011'; full_name='คุณแนน'; phone='0938250176'; service_interest='Botox กราม'; status='รอติดตาม'; last_visit_date='2026-07-06'; next_followup='2026-07-17' },
  @{ customer_id='C012'; full_name='คุณฝน'; phone='0874469315'; service_interest='วิตามินผิว'; status='นัดแล้ว'; last_visit_date='2026-07-14'; next_followup='2026-07-21' },
  @{ customer_id='C013'; full_name='คุณแอน'; phone='0917352480'; service_interest='Filler ร่องแก้ม'; status='สำเร็จ'; last_visit_date='2026-07-05'; next_followup='เสร็จแล้ว' },
  @{ customer_id='C014'; full_name='คุณตาล'; phone='0883906612'; service_interest='เลเซอร์เส้นเลือดขอด'; status='รอติดตาม'; last_visit_date='2026-07-03'; next_followup='2026-07-18' },
  @{ customer_id='C015'; full_name='คุณบี'; phone='0948023711'; service_interest='ทรีตเมนต์สิว'; status='นัดแล้ว'; last_visit_date='2026-07-15'; next_followup='2026-07-29' },
  @{ customer_id='C016'; full_name='คุณออย'; phone='0835197246'; service_interest='Botox ริ้วรอย'; status='เกินกำหนด'; last_visit_date='2026-07-04'; next_followup='2026-07-13' },
  @{ customer_id='C017'; full_name='คุณพลอย'; phone='0972641185'; service_interest='Filler คาง'; status='รอยืนยัน'; last_visit_date='2026-07-12'; next_followup='2026-07-26' },
  @{ customer_id='C018'; full_name='คุณหญิง'; phone='0859774302'; service_interest='ปรึกษาผิว'; status='สำเร็จ'; last_visit_date='2026-07-10'; next_followup='เสร็จแล้ว' },
  @{ customer_id='C019'; full_name='คุณฟ้า'; phone='0986013527'; service_interest='วิตามินผิว'; status='รอติดตาม'; last_visit_date='2026-07-13'; next_followup='2026-07-20' },
  @{ customer_id='C020'; full_name='คุณดาว'; phone='0817339046'; service_interest='เลเซอร์ขน'; status='นัดแล้ว'; last_visit_date='2026-07-11'; next_followup='2026-07-24' }
)

$results = foreach ($customer in $customers) {
  $customer.source = 'Mock Data Import'
  $customer.consent_contact = $true
  $customer.medical_note = "บริการ: $($customer.service_interest) | เข้าล่าสุด: $($customer.last_visit_date) | ติดตาม: $($customer.next_followup)"
  $payload = @{ action='addCustomer'; apiKey=$ApiKey; data=$customer } | ConvertTo-Json -Depth 5 -Compress
  try {
    $response = Invoke-RestMethod -Uri $Endpoint -Method Post -ContentType 'text/plain; charset=utf-8' -Body $payload
    [pscustomobject]@{ customer_id=$customer.customer_id; name=$customer.full_name; ok=[bool]$response.ok; result=if($response.ok){'ADDED'}else{$response.error} }
  } catch {
    [pscustomobject]@{ customer_id=$customer.customer_id; name=$customer.full_name; ok=$false; result=$_.Exception.Message }
  }
}

$results | Format-Table -AutoSize
[pscustomobject]@{
  Added = @($results | Where-Object result -eq 'ADDED').Count
  Duplicate = @($results | Where-Object result -eq 'DUPLICATE_PHONE').Count
  Failed = @($results | Where-Object { -not $_.ok -and $_.result -ne 'DUPLICATE_PHONE' }).Count
}
