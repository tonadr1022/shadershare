package util

import (
	"bufio"
	"log"
	"math/rand"
	"os"
	"strconv"
)

var (
	animals    []string
	adjectives []string
)

func InitUsernameGenerator() {
	// read adjectives.txt and animals.txt into arrays
	adjFile, err := os.Open("adjectives.txt")
	if err != nil {
		log.Fatalf("failed to open file: %v", err)
	}
	defer adjFile.Close()
	animalFile, err := os.Open("animals.txt")
	if err != nil {
		log.Fatalf("failed to open file: %v", err)
	}
	defer animalFile.Close()
	adjectives = readLines(adjFile)
	animals = readLines(animalFile)
}

func RandUsername() string {
	animal := animals[rand.Intn(len(animals))]
	adjective := adjectives[rand.Intn(len(adjectives))]
	suffix := rand.Intn(1000)
	return adjective + "_" + animal + "_" + strconv.Itoa(suffix)
}

func readLines(file *os.File) []string {
	var lines []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		log.Fatalf("Error reading file %v", err)
	}
	return lines
}

func generateNumbers(min, max, length int) []int {
	nums := make([]int, length)
	for i := 0; i < length; i++ {
		nums[i] = rand.Intn(max-min+1) + min
	}
	return nums
}
