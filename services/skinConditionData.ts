export interface ConditionImage {
    url: string;
    description: string;
}

// LƯU Ý: Các khóa (key) nên được viết bằng chữ thường để việc so khớp không phân biệt chữ hoa/thường.
export const SKIN_CONDITION_IMAGES: Record<string, ConditionImage[]> = {
    "mụn trứng cá viêm": [
        { 
            url: "https://placehold.co/400x300/f87171/ffffff.png?text=Mụn+viêm", 
            description: "Hình ảnh cận cảnh mụn viêm với đặc điểm sưng đỏ, có thể có mủ trắng ở trung tâm." 
        },
        { 
            url: "https://placehold.co/400x300/ef4444/ffffff.png?text=Mụn+nang", 
            description: "Mụn nang, một dạng mụn viêm nặng, ăn sâu dưới da, gây đau và có nguy cơ để lại sẹo cao." 
        },
    ],
    "tăng sắc tố sau viêm": [
        { 
            url: "https://placehold.co/400x300/a16207/ffffff.png?text=Thâm+mụn", 
            description: "Các vết thâm nâu hoặc đen (PIH) xuất hiện trên da sau khi tổn thương mụn đã lành." 
        },
        { 
            url: "https://placehold.co/400x300/854d0e/ffffff.png?text=PIH+trên+da", 
            description: "Tăng sắc tố sau viêm có thể xuất hiện dưới dạng các mảng da sẫm màu không đều." 
        },
    ],
    "nám da": [
        { 
            url: "https://placehold.co/400x300/78350f/ffffff.png?text=Nám+mảng", 
            description: "Nám mảng (Melasma) biểu hiện dưới dạng các mảng màu nâu đối xứng, thường ở trên má." 
        },
        { 
            url: "https://placehold.co/400x300/57534e/ffffff.png?text=Nám+chân+sâu", 
            description: "Nám chân sâu với các đốm sắc tố sẫm màu nằm sâu hơn trong lớp bì của da." 
        },
    ],
     "lão hóa da": [
        { 
            url: "https://placehold.co/400x300/a8a29e/ffffff.png?text=Nếp+nhăn", 
            description: "Nếp nhăn và rãnh sâu là dấu hiệu phổ biến của lão hóa da do mất collagen và elastin." 
        },
        { 
            url: "https://placehold.co/400x300/78716c/ffffff.png?text=Da+chảy+xệ", 
            description: "Da chảy xệ, mất độ đàn hồi, đặc biệt là ở vùng hàm và má." 
        },
    ],
};
