
import moment from "moment/moment"

export const convertDateTime = (date) => {
    return moment(date).locale('th').add(543, "years").format("วันที่ DD/MM/YYYY เวลา HH:mm น.")
}

export const convertDate = (date) => {
    return moment(date).locale('th').add(543, "years").format("วันที่ DD/MM/YYYY")
}