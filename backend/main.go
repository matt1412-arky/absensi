package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

// Models
type Student struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	Points    int    `json:"points"`
	CreatedAt time.Time
}

type Attendance struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	StudentID uint   `json:"student_id"`
	Date      string `json:"date"`   // "YYYY-MM-DD"
	Status    string `json:"status"` // "present","absent","sick","permission"
	Points    int    `json:"points"`
	CreatedAt time.Time
}

type Schedule struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Day       int    `json:"day"`  // 1=Monday ... 7=Sunday
	TimeSlot  string `json:"time"` // e.g. "08:30"
	CreatedAt time.Time
}

func main() {
	var err error
	db, err = gorm.Open(sqlite.Open("./attendance.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect db: " + err.Error())
	}

	// migrations
	db.AutoMigrate(&Student{}, &Attendance{}, &Schedule{})

	r := gin.Default()
	r.Use(cors.Default()) // allow localhost frontend during dev

	api := r.Group("/api")
	{
		// Students
		api.GET("/students", getStudents)
		api.POST("/students", createStudent)
		api.PUT("/students/:id", updateStudent)
		api.DELETE("/students/:id", deleteStudent)

		// Schedules
		api.GET("/schedules", getSchedules)
		api.POST("/schedules", createSchedule)
		api.DELETE("/schedules/:id", deleteSchedule)

		// Attendance
		api.POST("/attendance", createOrUpdateAttendance)
		api.GET("/attendance", getAttendance) // optional filters

		// Stats
		api.GET("/stats", getStats)

		// Dev helper: seed small data (optional)
		api.POST("/seed", seedData)
	}

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Attendance backend running")
	})

	r.Run(":8080")
}

// Handlers

func getStudents(c *gin.Context) {
	var students []Student
	db.Order("id asc").Find(&students)
	c.JSON(http.StatusOK, students)
}

func createStudent(c *gin.Context) {
	var payload struct {
		Name   string `json:"name"`
		Points int    `json:"points"`
	}
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s := Student{Name: payload.Name, Points: payload.Points}
	db.Create(&s)
	c.JSON(http.StatusOK, s)
}

func updateStudent(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	var payload struct {
		Name   string `json:"name"`
		Points int    `json:"points"`
	}
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var s Student
	if err := db.First(&s, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "student not found"})
		return
	}
	s.Name = payload.Name
	s.Points = payload.Points
	db.Save(&s)
	c.JSON(http.StatusOK, s)
}

func deleteStudent(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	db.Delete(&Student{}, id)
	c.JSON(http.StatusOK, gin.H{"deleted": id})
}

// Schedule
func getSchedules(c *gin.Context) {
	var s []Schedule
	db.Order("day asc, time_slot asc").Find(&s)
	c.JSON(http.StatusOK, s)
}

func createSchedule(c *gin.Context) {
	var payload struct {
		Day  int    `json:"day"`  // 1..7
		Time string `json:"time"` // "08:30"
	}
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	s := Schedule{Day: payload.Day, TimeSlot: payload.Time}
	db.Create(&s)
	c.JSON(http.StatusOK, s)
}

func deleteSchedule(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	db.Delete(&Schedule{}, id)
	c.JSON(http.StatusOK, gin.H{"deleted": id})
}

// Attendance: create or update (only one record per student per date)
func createOrUpdateAttendance(c *gin.Context) {
	var payload struct {
		StudentID uint   `json:"student_id"`
		Date      string `json:"date"`   // "YYYY-MM-DD"
		Status    string `json:"status"` // present/absent/sick/permission
		Points    int    `json:"points"`
	}
	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// validate date format
	if _, err := time.Parse("2006-01-02", payload.Date); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "date must be YYYY-MM-DD"})
		return
	}
	var student Student
	if err := db.First(&student, payload.StudentID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "student not found"})
		return
	}

	// check existing attendance
	var existing Attendance
	res := db.Where("student_id = ? AND date = ?", payload.StudentID, payload.Date).First(&existing)
	if res.Error == nil {
		// update existing record, and adjust student's points by delta
		delta := payload.Points - existing.Points
		existing.Status = payload.Status
		existing.Points = payload.Points
		db.Save(&existing)
		student.Points += delta
		db.Save(&student)
		c.JSON(http.StatusOK, existing)
		return
	}

	// create new
	a := Attendance{
		StudentID: payload.StudentID,
		Date:      payload.Date,
		Status:    payload.Status,
		Points:    payload.Points,
	}
	db.Create(&a)
	student.Points += payload.Points
	db.Save(&student)
	c.JSON(http.StatusOK, a)
}

func getAttendance(c *gin.Context) {
	studentID := c.Query("student_id")
	start := c.Query("start") // optional
	end := c.Query("end")
	var attendances []Attendance
	query := db
	if studentID != "" {
		id, _ := strconv.Atoi(studentID)
		query = query.Where("student_id = ?", id)
	}
	if start != "" && end != "" {
		query = query.Where("date BETWEEN ? AND ?", start, end)
	}
	query.Order("date desc").Find(&attendances)
	c.JSON(http.StatusOK, attendances)
}

// Stats: for a date range, compute total scheduled sessions and present counts per student
func getStats(c *gin.Context) {
	start := c.Query("start")
	end := c.Query("end")
	if start == "" || end == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "start and end required (YYYY-MM-DD)"})
		return
	}
	// load schedules
	var schedules []Schedule
	db.Find(&schedules)
	// build set of days
	days := map[int]bool{}
	for _, s := range schedules {
		days[s.Day] = true
	}
	totalSessions := countScheduledSessions(start, end, days)

	// students and their present count
	var students []Student
	db.Order("id asc").Find(&students)
	type Stat struct {
		StudentID      uint   `json:"student_id"`
		Name           string `json:"name"`
		Points         int    `json:"points"`
		PresentCount   int64  `json:"present_count"`
		TotalSessions  int    `json:"total_sessions"`
		AttendanceRate string `json:"attendance_rate"`
	}
	var out []Stat
	for _, s := range students {
		var cnt int64
		db.Model(&Attendance{}).
			Where("student_id = ? AND date BETWEEN ? AND ? AND status = ?", s.ID, start, end, "present").
			Count(&cnt)
		rate := "0.00%"
		if totalSessions > 0 {
			r := (float64(cnt) / float64(totalSessions)) * 100.0
			rate = strconv.FormatFloat(r, 'f', 2, 64) + "%"
		}
		out = append(out, Stat{
			StudentID:      s.ID,
			Name:           s.Name,
			Points:         s.Points,
			PresentCount:   cnt,
			TotalSessions:  totalSessions,
			AttendanceRate: rate,
		})
	}
	c.JSON(http.StatusOK, gin.H{
		"total_sessions": totalSessions,
		"students":       out,
	})
}

// helper: count scheduled sessions in date range inclusive
func countScheduledSessions(startStr, endStr string, days map[int]bool) int {
	start, err1 := time.Parse("2006-01-02", startStr)
	end, err2 := time.Parse("2006-01-02", endStr)
	if err1 != nil || err2 != nil {
		return 0
	}
	count := 0
	for d := start; !d.After(end); d = d.AddDate(0, 0, 1) {
		// Go: Weekday type: Sunday=0, Monday=1 ...
		weekday := int(d.Weekday()) // Sunday=0
		// Convert to 1..7 (Monday=1 ... Sunday=7)
		var dow int
		if weekday == 0 {
			dow = 7
		} else {
			dow = weekday
		}
		if days[dow] {
			count++
		}
	}
	return count
}

// Seed (dev) - optional: adds sample students + schedules
func seedData(c *gin.Context) {
	db.Exec("DELETE FROM attendances")
	db.Exec("DELETE FROM schedules")
	db.Exec("DELETE FROM students")

	students := []Student{
		{Name: "Budi", Points: 0},
		{Name: "Siti", Points: 0},
		{Name: "Andi", Points: 0},
	}
	for _, s := range students {
		db.Create(&s)
	}
	// add Mon, Tue, Thu, Fri at 08:00
	db.Create(&Schedule{Day: 1, TimeSlot: "08:00"})
	db.Create(&Schedule{Day: 2, TimeSlot: "08:00"})
	db.Create(&Schedule{Day: 4, TimeSlot: "08:00"})
	db.Create(&Schedule{Day: 5, TimeSlot: "08:00"})
	c.JSON(http.StatusOK, gin.H{"seeded": true})
}
