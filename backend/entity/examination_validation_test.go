package entity

import (
	"testing"
	"time"

	"github.com/asaskevich/govalidator"
	. "github.com/onsi/gomega"
)

func TestExaminationPass(t *testing.T) {
	g := NewGomegaWithT(t)

	// ข้อมูลถูกต้องหมดทุก field
	examination := Examination{
		ChiefComplaint: "",
		Treatment:      "ทานยา",
		Cost:           500,
		DiagnosisTime:  time.Now(),
	}

	// ตรวจสอบด้วย govalidator
	ok, err := govalidator.ValidateStruct(examination)

	// ok ต้องเป็น true แปลว่าไม่มี error
	g.Expect(ok).To(BeTrue())

	// err ต้องเป็น nil แปลว่าไม่มี error
	g.Expect(err).To(BeNil())
}

// ตรวจสอบวิธีการรักษาต้องไม่เป็นค่าว่าง
func TestTreatmentNotBlank(t *testing.T) {
	g := NewGomegaWithT(t)

	examination := Examination{
		ChiefComplaint: "",
		Treatment:      "",
		Cost:           500,
		DiagnosisTime:  time.Now(),
	}

	// ตรวจสอบด้วย govalidator
	ok, err := govalidator.ValidateStruct(examination)

	// ok ต้องไม่เป็นค่า true แปลว่าต้องจับ error ได้
	g.Expect(ok).ToNot(BeTrue())

	// err ต้องไม่เป็นค่า nil แปลว่าต้องจับ error ได้
	g.Expect(err).ToNot(BeNil())

	// err.Error ต้องมี error message แสดงออกมา
	g.Expect(err.Error()).To(Equal("Treatment Not Blank"))
}
