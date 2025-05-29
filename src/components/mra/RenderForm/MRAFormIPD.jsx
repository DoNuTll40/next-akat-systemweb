"use client"

import { Document, Font, Image, Page, Path, Svg, Text, View } from "@react-pdf/renderer"
import moment from "moment/moment";
import { createTw } from "react-pdf-tailwind";

Font.register({
  family: 'Sarabun',
  fonts: [
    { src: '/hospital/fonts/sarabun_new/THSarabunNew.ttf', fontWeight: "normal" },
    { src: '/hospital/fonts/sarabun_new/THSarabunNew Bold.ttf', fontWeight: "bold" },
  ],
})

const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Sarabun"],
    },
    extend: {
      colors: {
        custom: "#bada55",
      },
    },
  },
});


const criteriaKeys = Array.from({ length: 9 }, (_, i) => `criterion_number_${i + 1}`);


export default function MRAFormIPD({ patients, form_ipd_content_of_medical_record_results, form_ipd_overall_finding_results, form_ipd_review_status_results, formattedResultSum, totalDefaultSum, totalScoreSum, created_by, updated_at }) {
  return (
    <Document 
      title={`MRA-IPD-${patients?.patient_an}`}
      author="โรงพยาบาลอากาศอำนวย"
      subject="แบบตรวจประเมินคุณภำพกำรบันทึกเวชระเบียนผู้ป่วยใน Medical Record Audit Form (IPD)"
      creator="© Copyright 2025 โรงพยาบาลอากาศอำนวย"
      producer="react-pdf"
      pdfVersion="1.7"
      >
      <Page size="A4" orientation="landscape" style={[tw("p-8 pt-5 font-sans text-base"), { lineHeight: 1 }]} textLayer={false}>
        <Image 
          src="/hospital/images/nhso-logo-pink.png" 
          style={tw("w-32 h-auto mt-4 mx-auto")} 
        />
        <Text style={[tw("text-center font-bold text-[#ec028d] text-xl my-0.5"), { lineHeight: 1 }]}>แบบตรวจประเมินคุณภำพกำรบันทึกเวชระเบียนผู้ป่วยใน Medical Record Audit Form (IPD)</Text>

        {/* Header Input Form */}
        <View style={tw("relative")}>
            <Text style={[tw("font-bold text-xl"), { lineHeight: 0.9 }]}>HCode……………………… Hname………………………………………………   HN…………………………   AN……………………… Date admitted……………………   Date discharged …………………………</Text>
            <Text style={[tw("text-lg absolute"), { top: -1, left: 40, lineHeight: 0.9 }]}>
                {patients?.hcodes?.hcode || '11098'}
            </Text>

            <Text style={[tw("text-lg absolute"), { top: -1, left: 142, lineHeight: 0.9 }]}>
                {patients?.hcodes?.hcode_name || ''}
            </Text>

            <Text style={[tw("text-lg absolute"), { top: -1, left: 310, lineHeight: 0.9 }]}>
                {patients?.patient_hn || ''}
            </Text>

            <Text style={[tw("text-lg absolute"), { top: -1, left: 410, lineHeight: 0.9 }]}>
                {patients?.patient_an || ''}
            </Text>

            <Text style={[tw("text-lg absolute"), { top: -1, left: 545, lineHeight: 0.9 }]}>
                {moment(patients?.patient_date_admitted).add(543, "year").format('DD/MM/YYYY') || ''}
            </Text>

            <Text style={[tw("text-lg absolute"), { top: -1, left: 700, lineHeight: 0.9 }]}>
                {moment(patients?.patient_date_discharged).add(543, "year").format('DD/MM/YYYY') || ''}
            </Text>
        </View>

        {/* Description Header */}
        <View>
            <Text style={[tw("text-xl"), { lineHeight: 0.9 }]}><Text style={[tw("font-bold")]} >การบันทึกช่อง NA: </Text>กรณีไม่จำเป็นต้องมีเอกสารใน Content ลำดับที่ 7, 8, 9, 10, 11 เนื่องจากไม่มีการให้บริการ ให้กากบาท ในช่อง NA</Text>
            <Text style={[tw("text-xl"), { lineHeight: 0.9 }]}><Text style={[tw("font-bold")]} >กำรบันทึกช่อง Missing: </Text>กรณีไม่มีเอกสารให้ตรวจสอบ เวชระเบียนไม่ครบ หรือหายไป ให้ กากบาทในช่อง Missing</Text>
            <Text style={[tw("text-xl"), { lineHeight: 0.9 }]}><Text style={[tw("font-bold")]} >กำรบันทึกช่อง No: </Text>กรณีมีเอกสารแต่ไม่มีการบันทึกในเอกสารนั้น ให้กากบาทในช่อง “No”</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <Text style={[tw("text-xl"), { lineHeight: 0.9 }]}>
                <Text style={tw("font-bold")}>กำรบันทึกคะแนน: </Text>
                (1) กรณีที่ผ่านเกณฑ์ในแต่ละข้อ ให้ 1 คะแนน (2) กรณีที่ไม่ผ่านเกณฑ์ในแต่ละข้อ ให้ 0 คะแนน (3) กรณีไม่จำเป็นต้องมีบันทึก/ไม่มีข้อมูล 
              </Text>
              <View style={[tw("pl-1.5"), { flexDirection: 'column' }]}>
                <Text style={[tw("text-xl"), { lineHeight: 0.87 }]}>ในเกณฑ์ข้อที่ระบุให้มี NA</Text>
                <View style={[{ height: 0.5, backgroundColor: '#000', lineHeight: 0.5 }]} />
              </View>
              <Text style={[tw("text-xl"), { lineHeight: 0.9 }]}> ได้ ให้ NA</Text>
            </View>
        </View>

        {/* Table render and Option */}
        <View style={[tw("flex flex-col mt-4 text-lg"), { lineHeight: 0.9 }]}>
            {/* Header */}
            <View style={tw("flex-row bg-[#ec028d] border-[0.5px] border-white h-12")}>
                <View style={tw("w-[23%] border-r-[0.5px] border-white flex items-center justify-center")}>
                    <Text style={tw("font-bold text-white")}>Content</Text>
                </View>
                <View style={tw("w-[5%] border-r-[0.5px] border-white flex items-center justify-center")}>
                    <Text style={tw("font-bold text-white")}>NA</Text>
                </View>
                <View style={tw("w-[7%] border-r-[0.5px] border-white flex items-center justify-center")}>
                    <Text style={tw("font-bold text-white")}>Missing</Text>
                </View>
                <View style={tw("w-[4%] border-r-[0.5px] border-white flex items-center justify-center")}>
                    <Text style={tw("font-bold text-white")}>No</Text>
                </View>
                {criteriaKeys.map((key, i) => (
                  <View key={key} style={tw("w-[5%] border-r-[0.5px] border-white pt-[2px] flex items-center")}>
                    <Text style={[tw("font-bold text-white text-center"), { lineHeight: 0.85 },]}>{`เกณฑ์\nข้อ ${i + 1}`}</Text>
                  </View>
                ))}
                <View style={tw("w-[7%] border-r-[0.5px] border-white pt-[2px] flex items-center")}>
                    <Text style={[tw("font-bold text-white text-center"), { lineHeight: 0.85 },]}>{`หัก\nคะแนน`}</Text>
                </View>
                <View style={[tw("w-[7%] border-r-[0.5px] border-white pt-[2px] flex items-center")]}>
                    <Text style={[tw("font-bold text-white text-center"), { lineHeight: 0.85 },]}>{`รวม\nคะแนน`}</Text>
                </View>
                <View style={tw("w-[19%] flex items-center justify-center")}>
                    <Text style={tw("font-bold text-white")}>หมายเหตุ</Text>
                </View>
            </View>

            {/* Row */}
            {form_ipd_content_of_medical_record_results?.map((item, index) => (
              <View
                key={item.form_ipd_content_of_medical_record_result_id || index}
                style={[tw("flex-row border border-t-0 border-[#ec028d] text-base h-6"), { lineHeight: 0.5 }]}
              >
                {/* Content Name */}
                <View style={tw("w-[23%] border-r border-[#ec028d] pl-1 pt-[3px] font-bold")}>
                  <Text>{index+1}. {item.content_of_medical_records?.content_of_medical_record_name}</Text>
                </View>

                {/* Score / NA / Missing / No */}
                <View style={[tw("w-[5%] border-r border-[#ec028d] pt-[3px] items-center"), { backgroundColor: !item?.content_of_medical_records?.na_type ? '#f8c0d8' : null }]}>
                  {item.na ? (
                    <Svg width="10" height="10" viewBox="0 0 24 24">
                      <Path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </Svg>
                  ) : null}
                </View>

                <View style={tw("w-[7%] border-r border-[#ec028d] pt-[3px] items-center")}>
                  {item.missing ? (
                    <Svg width="10" height="10" viewBox="0 0 24 24">
                      <Path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </Svg>
                  ) : null}
                </View>

                <View style={tw("w-[4%] border-r border-[#ec028d] pt-[3px] items-center")}>
                  {item.no ? (
                    <Svg width="10" height="10" viewBox="0 0 24 24">
                      <Path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </Svg>
                  ) : null}
                </View>

                {criteriaKeys.map((key, i) => {
                  const typeKey = `${key}_type`;
                  const isMissingType = !item?.content_of_medical_records?.[typeKey];

                  return (
                    <View
                      key={key} style={[tw("w-[5%] border-r border-[#ec028d] pl-1 pt-[3px] items-center"), { backgroundColor: isMissingType ? "#f8c0d8" : null }]}>
                      <Text>{!isMissingType ? (item?.[key] ? "1" : "0") : ""}</Text>
                    </View>
                  );
                })}

                <View style={[tw("w-[7%] border-r border-[#ec028d] pl-1 pt-[3px] items-center"), { backgroundColor: !item?.content_of_medical_records?.points_deducted_type ? '#f8c0d8' : null }]}>
                  <Text>{item?.content_of_medical_records?.points_deducted_type && ( item.point_deducted || 0 )}</Text>
                </View>

                <View style={tw("w-[7%] border-r border-[#ec028d] pl-1 pt-[3px] items-center")}>
                  <Text>{item.total_score || 0}</Text>
                </View>

                {/* Comment */}
                <View style={tw("w-[19%] pl-1 pt-[3px]")}>
                  <Text>{item.comment}</Text>
                </View>
              </View>
            ))}
        </View>

        {/* Sum Input Form */}
        <View style={[tw("relative w-full pl-[13.3rem]"), { lineHeight: 1 }]}>
          <Text style={[tw("pl-1 pt-[4.5px] font-bold text-xl"), { lineHeight: 1 }]}>คะแนนเต็ม (Full score) รวม…….....…….…..คะแนน (ต้องไม่น้อยกว่ำ	57 คะแนน) คะแนนที่ได้ (Sum score) ………………………. ร้อยละ ………………………..</Text>
          <Text style={[tw("text-lg absolute"), { top: 3, left: 295, lineHeight: 0.9 }]}>
            {totalDefaultSum}
          </Text>

          <Text style={[tw("text-lg absolute"), { top: 3, left: 615, lineHeight: 0.9 }]}>
            {totalScoreSum}
          </Text>

          <Text style={[tw("text-lg absolute"), { top: 3, left: 720, lineHeight: 0.9 }]}>
            {formattedResultSum || 0}
          </Text>
        </View>

        {/* Footer Form */}
        <View style={[tw("relative mt-1"), { lineHeight: 0.9 }]}>
          <View style={[{ flexDirection: 'column'}]}>
            <Text style={[tw("text-xl font-bold"), { lineHeight: 0.87 }]}>ประเมินคุณภำพกำรบันทึกเวชระเบียนในภาพรวม</Text>
            <View style={[{ height: 0.5, backgroundColor: '#000', lineHeight: 0.5, width: 200, }]} />
          </View>
        </View>

        <View style={[tw("relative mt-1 flex flex-row gap-5"), { lineHeight: 0.9 }]}>
          <Text style={[tw("text-xl font-bold"), { lineHeight: 0.87 }]}>Overall finding</Text>
          <View style={[tw("text-xl flex"), { lineHeight: 0.9 }]}>
            <View style={[tw("relative"), { lineHeight: 0.9 }]}>
              <Text style={[{ lineHeight: 0.9 }]}>(...) การจัดเรียงเวชระเบียนไม่เป็นไปตามมาตรฐานที่กำหนด</Text>
              {form_ipd_overall_finding_results?.find(x => x.overall_finding?.overall_finding_id === 1)?.overall_finding_result && (
                <Svg style={[tw("absolute"), { lineHeight: 0.9, top: 2, left: 2.5 }]} width="12" height="12" viewBox="0 0 24 24">
                  <Path
                    d="M20.285 2.715L9 14l-5.285-5.285L2 10.43 9 17.43l13-13z"
                    fill="black"
                  />
              </Svg>
              )}
            </View>
            <View style={[tw("relative"), { lineHeight: 0.9 }]}>
              <Text style={[{ lineHeight: 0.9 }]}>(...) เอกสารบางแผ่น ไม่มีชื่อผู้รับบริการ HN AN ทำให้ไม่สามารถระบุได้ว่า เอกสารแผ่นนี้เป็นของใครจึงไม่สามารถทบทวนเอกสารแผ่นนั้นได้</Text>
              {form_ipd_overall_finding_results?.find(x => x.overall_finding?.overall_finding_id === 2)?.overall_finding_result && (
                <Svg style={[tw("absolute"), { lineHeight: 0.9, top: 2, left: 2.5 }]} width="12" height="12" viewBox="0 0 24 24">
                  <Path
                    d="M20.285 2.715L9 14l-5.285-5.285L2 10.43 9 17.43l13-13z"
                    fill="black"
                  />
              </Svg>
              )}
            </View>
            <View style={[tw("flex flex-row gap-2 pl-[3.2rem]"), { lineHeight: 0.9 }]}>
              <Text style={[tw("font-bold"), { lineHeight: 0.9 }]}>(เลือกเพียง 1 ข้อ)</Text>
              <View style={[tw("flex"), { lineHeight: 0.9 }]}>
                <View style={[tw("relative"), { lineHeight: 0.9 }]}>
                  <Text style={[{ lineHeight: 0.9 }]}>(...) Documentation inadequate for meaningful review</Text>
                  {form_ipd_review_status_results?.find(x => x.review_status?.review_status_id === 1)?.review_status_result && (
                    <Svg style={[tw("absolute"), { lineHeight: 0.9, top: 2, left: 2.5 }]} width="12" height="12" viewBox="0 0 24 24">
                      <Path
                        d="M20.285 2.715L9 14l-5.285-5.285L2 10.43 9 17.43l13-13z"
                        fill="black"
                      />
                  </Svg>
                  )}
                </View>
                <View style={[tw("relative"), { lineHeight: 0.9 }]}>
                  <Text style={[{ lineHeight: 0.9 }]}>(...) No significant medical record issue identified</Text>
                  {form_ipd_review_status_results?.find(x => x.review_status?.review_status_id === 2)?.review_status_result && (
                    <Svg style={[tw("absolute"), { lineHeight: 0.9, top: 2, left: 2.5 }]} width="12" height="12" viewBox="0 0 24 24">
                      <Path
                        d="M20.285 2.715L9 14l-5.285-5.285L2 10.43 9 17.43l13-13z"
                        fill="black"
                      />
                  </Svg>
                  )}
                </View>
                <View style={[tw("relative"), { lineHeight: 0.9 }]}>
                  <Text style={[{ lineHeight: 0.9 }]}>(...) Certain issues in question specify</Text>
                  {form_ipd_review_status_results?.find(x => x.review_status?.review_status_id === 3)?.review_status_result && (
                    <Svg style={[tw("absolute"), { lineHeight: 0.9, top: 2, left: 2.5 }]} width="12" height="12" viewBox="0 0 24 24">
                      <Path
                        d="M20.285 2.715L9 14l-5.285-5.285L2 10.43 9 17.43l13-13z"
                        fill="black"
                      />
                  </Svg>
                  )}
                </View>
              </View>
              <View style={[tw("flex"), { lineHeight: 0.9 }]}>
                <Text style={[{ lineHeight: 0.9 }]}>(ข้อมูลไม่เพียงพอสำหรับการทบทวน)</Text>
                <Text style={[{ lineHeight: 0.9 }]}>(ไม่มีปัญหาสำคัญจากการทบทวน)</Text>
                <View style={[tw("relative"), { lineHeight: 0.9 }]}>
                  <Text style={[{ lineHeight: 0.9 }]}>(มีปัญหาจากการทบทวนที่ต้องค้นต่อ ระบุ....................................................................)</Text>
                    <Text style={[tw("text-lg absolute"), { top: -1, left: 165, lineHeight: 0.9 }]}>
                      {form_ipd_review_status_results[0].review_status_comment}
                    </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={tw("w-full relative flex-row justify-end mt-2")}>
          <Text style={tw("text-xl text-right")}>
            Audit by……………………………….... Audit Date ……………………………
          </Text>
          <Text style={[tw("text-lg absolute"), { top: -3, left: 572, lineHeight: 0.9, width: 250 }]}>
            {created_by}
          </Text>
          <Text style={[tw("text-lg absolute"), { top: -3, left: 720, lineHeight: 0.9, width: 250 }]}>
            {moment(updated_at).add(543, "year").format('DD/MM/YYYY')}
          </Text>
        </View>

      </Page>
    </Document>
  )
}
