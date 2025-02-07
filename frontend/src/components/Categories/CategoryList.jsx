import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pencil,
  Search,
  Trash2,
  ChevronDown,
  X,
  ArrowDownUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axios from "@/helper/axios";
import debounce from "lodash.debounce";
import { useSearchParams } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryList({ categories, setCategories, loading }) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const sortDirection = searchParams.get("sortDirection") || "";

  const isMobile = useMediaQuery({ maxWidth: 640 });

  const { toast } = useToast();

  const editForm = useForm({
    defaultValues: {
      name: "",
      // defaultQuantity: "1",
      // defaultPrice: 0,
    },
  });

  const handleOpenDialog = (category) => {
    setEditingCategory(category);
    editForm.setValue("name", category.name);
  };

  const handleCloseDialog = () => {
    setEditingCategory(null);
  };

  async function onEdit(values) {
    try {
      toast({
        title: "Updating Category",
        description: "Please wait a moment...",
      });
      const token = localStorage.getItem("twj");
      const res = await axios.patch(
        `/api/categories/${editingCategory._id}`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
          duration: 3000,
          variant: "success",
        });
        setCategories((prevItems) =>
          prevItems.map((item) =>
            item._id === editingCategory._id ? { ...item, ...res.data } : item
          )
        );
        editForm.reset();
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: error.response.data
          ? error.response.data.msg
          : "There was an issue updating the category. Please try again.",
        variant: "error",
      });
    }
  }

  async function onDeleteItem() {
    try {
      toast({
        title: "Deleting Category",
        description: "Please wait a moment...",
      });
      const token = localStorage.getItem("twj");
      const res = await axios.delete(
        `/api/categories/${deletingCategory._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        toast({
          title: "Category deleted",
          description: "The category has been deleted successfully.",
          duration: 3000,
          variant: "success",
        });
        setCategories((prevItems) =>
          prevItems.filter((item) => item._id !== deletingCategory._id)
        );
        handleCloseDialog();
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: error.response.data
          ? error.response.data.msg
          : "There was an issue deleting the category. Please try again.",
        variant: "error",
      });
    }
  }

  const clearSearch = () => {
    searchParams.delete("search");
    setSearchParams(searchParams);
  };

  const debouncedSearch = debounce((query) => {
    if (query) {
      searchParams.set("search", query);
      setSearchParams(searchParams);
    } else {
      clearSearch();
    }
  }, 300);

  const handleChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleRadioChange = (value) => {
    searchParams.set("sort", value);
    setSearchParams(searchParams);
  };

  const handleSortDirectionChange = (value) => {
    searchParams.set("sortDirection", value);
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-6 pt-3">
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Category List</h3>
          <div className="flex  sm:flex-row gap-4 justify-between">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search purchases..."
                className="pl-8 bg-card border-input w-full focus:ring-blue-500 focus:ring-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus:border-input focus:ring-ring"
                value={search}
                onChange={handleChange}
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={clearSearch}
                >
                  <X className="h-1 w-1" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="bg-card">
                  {isMobile ? (
                    <div className="p-2 border rounded-lg">
                      <ArrowDownUp className="w-5 h-5" />
                    </div>
                  ) : (
                    <Button variant="outline" className="gap-2">
                      Sort
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="">
                  <div className="p-2">
                    <RadioGroup
                      value={sort}
                      onValueChange={handleRadioChange}
                      className="gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="name"
                          id="name"
                          className=" text-white border-gray-300 
              before:h-2 before:w-2 before:bg-white
              data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500
              data-[state=checked]:before:bg-white mt-1"
                        />
                        <Label htmlFor="name">Name</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="createdAt"
                          id="created"
                          className=" text-white border-gray-300 
              before:h-2 before:w-2 before:bg-white
              data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500
              data-[state=checked]:before:bg-white mt-1"
                        />
                        <Label htmlFor="created">Created</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    {sort === "name" ? (
                      <>
                        <Button
                          variant="ghost"
                          className={`w-full px-0 ${
                            sortDirection === "asc"
                              ? "bg-accent"
                              : "font-normal"
                          }`}
                          onClick={() => handleSortDirectionChange("asc")}
                        >
                          A-Z
                        </Button>
                        <Button
                          variant="ghost"
                          className={`w-full px-0 ${
                            sortDirection === "desc"
                              ? "bg-accent"
                              : "font-normal"
                          }`}
                          onClick={() => handleSortDirectionChange("desc")}
                        >
                          Z-A
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className={`w-full px-0  ${
                            sortDirection === "asc"
                              ? "bg-accent"
                              : "font-normal"
                          }`}
                          onClick={() => handleSortDirectionChange("asc")}
                        >
                          Oldest first
                        </Button>
                        <Button
                          variant="ghost"
                          className={`w-full px-0  ${
                            sortDirection === "desc"
                              ? "bg-accent"
                              : "font-normal"
                          }`}
                          onClick={() => handleSortDirectionChange("desc")}
                        >
                          Newest first
                        </Button>
                      </>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {loading ? (
            <div className="space-y-3 mt-3">
              {Array.from({ length: 10 }).map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <Skeleton className="h-6 w-32" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-6" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories && categories.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center mt-8">
              No items added yet? Tap the + icon below to get started!
            </p>
          ) : (
            <ScrollArea>
              <div className="space-y-2 py-4">
                {categories.map((category) => (
                  <Card
                    key={category._id}
                    className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-gray-700/50 hover:border-gray-300 dark:hover:border-gray-500"
                  >
                    <CardContent className="p-0 bg-gray-50 dark:bg-gray-700 ">
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Dialog
                            open={
                              editingCategory &&
                              editingCategory._id === category._id
                            }
                            onOpenChange={(isOpen) => {
                              if (!isOpen) {
                                handleCloseDialog();
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(category)}
                                className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[310px] sm:w-[400px] md:w-full rounded-lg sm:rounded-lg">
                              <DialogHeader>
                                <DialogTitle>Edit Category</DialogTitle>
                                <DialogDescription className="hidden"></DialogDescription>
                              </DialogHeader>
                              <Form {...editForm}>
                                <form
                                  onSubmit={editForm.handleSubmit(onEdit)}
                                  className="space-y-4"
                                >
                                  <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>category Name</FormLabel>
                                        <FormControl>
                                          <Input
                                            {...field}
                                            autoComplete="off"
                                            {...editForm.register("name", {
                                              required: {
                                                value: true,
                                                message:
                                                  "Item name is required",
                                              },
                                            })}
                                            className="w-full bg-primary-foreground focus:ring-blue-500 focus:ring-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <Button
                                    type="submit"
                                    className=" bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md"
                                  >
                                    Update category
                                  </Button>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingCategory(category)}
                            className="text-pink-600 hover:text-pink-800 hover:bg-pink-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete this category permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? You won't be able
              to recover it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteItem}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
