import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Student } from "@/types/student";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StudentAutocompleteProps {
  students: Student[];
  value: string;
  onValueChange: (value: string) => void;
  onStudentSelect?: (student: Student | null) => void;
  placeholder?: string;
}

export const StudentAutocomplete = ({ 
  students, 
  value, 
  onValueChange, 
  onStudentSelect,
  placeholder = "Buscar alumna..." 
}: StudentAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    // Find student by name when value changes
    const student = students.find(s => 
      s.fullName.toLowerCase() === value.toLowerCase()
    );
    setSelectedStudent(student || null);
    onStudentSelect?.(student || null);
  }, [value, students, onStudentSelect]);

  const handleSelect = (student: Student) => {
    onValueChange(student.fullName);
    setSelectedStudent(student);
    onStudentSelect?.(student);
    setOpen(false);
  };

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder={placeholder}
            value={value}
            onValueChange={onValueChange}
          />
          <CommandList>
            <CommandEmpty>No se encontraron alumnas.</CommandEmpty>
            <CommandGroup>
              {filteredStudents.map((student) => (
                <CommandItem
                  key={student.id}
                  value={student.fullName}
                  onSelect={() => handleSelect(student)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedStudent?.id === student.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{student.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {student.school} - {student.level}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};