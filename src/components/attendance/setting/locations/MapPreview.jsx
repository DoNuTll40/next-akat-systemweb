import React, { useCallback } from 'react'
import { LoadScript, GoogleMap, Circle, Marker, OverlayView } from '@react-google-maps/api';

export default function MapPreview({ locations }) {

    const center = {
        lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT),
        lng: Number(process.env.NEXT_PUBLIC_DEFAULT_LON),
    };


    const mapContainerStyle = {
        width: '100%',
        height: '450px'
    };

    const handleMapContextMenu = useCallback((event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        const coordinates = `${lat}, ${lng}`;

        // คัดลอกค่าไปยังคลิปบอร์ด (ใช้ Clipboard API)
        navigator.clipboard.writeText(coordinates)
            .then(() => {
                alert(`คัดลอกพิกัดแล้ว: ${coordinates}`); // แจ้งเตือนผู้ใช้
            })
            .catch((err) => {
                console.error('ไม่สามารถคัดลอกพิกัด: ', err);
                alert('ไม่สามารถคัดลอกพิกัดไปยังคลิปบอร์ดได้'); // แจ้งเตือนข้อผิดพลาด
            });
    }, []);

    return (
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} language='th'>
            <GoogleMap onClick={(e) => handleMapContextMenu(e)} mapContainerClassName='rounded-lg shadow cursor-pointer' mapContainerStyle={mapContainerStyle} center={center} zoom={17} mapTypeId="roadmap" streetView={false} options={{ streetViewControl: false, mapTypeControl: true, fullscreenControl: false, zoomControl: false, disableDoubleClickZoom: true }}>
                {locations.map((loc) => (
                    <>
                        <Circle
                            key={loc.stl_id}
                            center={{ lat: loc.stl_lat, lng: loc.stl_lon }}
                            radius={loc.stl_radius}

                            options={{
                                strokeColor: '#000',
                                strokeOpacity: 0.6,
                                strokeWeight: 0.1,
                                fillColor: loc.stl_block ? '#f87171' : '#34d399',
                                fillOpacity: 0.5
                            }}
                        />

                        <Marker
                            position={{ lat: loc.stl_lat, lng: loc.stl_lon }}
                            label={{
                                text: `${loc.stl_name}`,
                                color: 'black',
                                fontWeight: 'bold',
                                fontFamily: "Sarabun",
                                fontSize: '12px',
                            }}

                            icon={{
                                path: "M 0,0 C -2,-20 -10,-22 -10,-30 A 20,20 0 1,1 10,-30 C 10,-22 2,-20 0,0 z", // ไอคอนเป็นวงกลมเล็กๆ หรือ
                                scale: 0,
                                fillOpacity: 0,
                                strokeOpacity: 0
                            }}
                        />
                    </>
                ))}
            </GoogleMap>
        </LoadScript>
    );
}
