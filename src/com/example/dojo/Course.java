package com.example.dojo;

import java.util.List;

public class Course {

	private int id;

	private String name;

	private String language;

	private List<Student> students;

	public Course() {
	}

	public Course(int id, String name, String language, List<Student> students) {
		this.id = id;
		this.name = name;
		this.language = language;
		this.students = students;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public List<Student> getStudents() {
		return students;
	}

	public void setStudents(List<Student> students) {
		this.students = students;
	}

	@Override
	public String toString() {
		return "Course [id=" + id + ", name=" + name + ", language=" + language
				+ ", students=" + students + "]";
	}
}
